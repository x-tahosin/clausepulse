/**
 * Pure Signal Processing & Biometric Math Utilities for ClausePulse
 * Operates on SmartSpectra protobuf time-series samples without DOM or Electron dependencies.
 */

import {
  ProtobufTimestamp,
  SmartSpectraExpression,
  SmartSpectraLandmarks,
  SmartSpectraMeasurement,
} from './types';

/**
 * Normalizes a protobuf timestamp (number, bigint, or Long) into microseconds as a JS number.
 */
export function normalizeTimestampUs(ts: ProtobufTimestamp): number {
  if (ts == null) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'bigint') return Number(ts);
  if (typeof ts === 'object' && typeof ts.toNumber === 'function') {
    return ts.toNumber();
  }
  return Number(ts) || 0;
}

/**
 * Computes the median of a numeric array. Returns null if empty.
 */
export function computeMedian(values: readonly number[]): number | null {
  if (!values || values.length === 0) return null;
  const sorted = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Computes the Interquartile Range (Q3 - Q1) for robust dispersion estimation.
 */
export function computeIqr(values: readonly number[]): number {
  if (!values || values.length < 4) return 1.5;
  const sorted = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length < 4) return 1.5;
  const q1Idx = Math.floor(sorted.length * 0.25);
  const q3Idx = Math.floor(sorted.length * 0.75);
  return Math.max(0.5, sorted[q3Idx] - sorted[q1Idx]);
}

/**
 * Computes sample standard deviation.
 */
export function computeStdDev(values: readonly number[]): number {
  if (!values || values.length < 2) return 0;
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length < 2) return 0;
  const mean = valid.reduce((acc, v) => acc + v, 0) / valid.length;
  const variance = valid.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (valid.length - 1);
  return Math.sqrt(variance);
}

/**
 * Detects "Reading / Screen Apnea" (unconscious breath-holding) from SmartSpectra's
 * chest (`upperTrace`) or abdomen (`lowerTrace`) movement waveform.
 *
 * Because SmartSpectra's built-in `APNEA` MetricType is marked Unavailable in v3.5.0
 * (requesting it causes ConfigurationFailed), ClausePulse computes breath-hold duration
 * directly from the derivative and rolling standard deviation of `upperTrace` while
 * gating out intervals where `isTalking` is true.
 */
export function computeApneaHoldSeconds(
  upperTraceSamples: readonly SmartSpectraMeasurement[],
  baselineTraceStdDev: number,
  isTalkingNow: boolean
): { currentHoldSec: number; maxHoldSec: number; traceStdDev: number } {
  if (isTalkingNow || !upperTraceSamples || upperTraceSamples.length < 8) {
    return { currentHoldSec: 0, maxHoldSec: 0, traceStdDev: 0 };
  }

  // Flatline threshold: 16% of the user's resting chest movement standard deviation
  // (with a safe floor of 0.045 so normal 4-second respiratory crests/troughs never false-trigger).
  const flatThreshold = Math.max(0.045, (baselineTraceStdDev || 0.35) * 0.16);

  const values = upperTraceSamples.map((s) => s.value);
  const overallStdDev = computeStdDev(values);

  // Slide a ~2.0-second local window (20 samples at 10Hz) across the trace so normal
  // end-inspiratory/expiratory pauses (<1.2s) do not register as apnea flatlines.
  const windowSize = Math.min(20, Math.max(6, Math.floor(upperTraceSamples.length / 3)));
  let currentHoldUs = 0;
  let maxHoldUs = 0;
  let holdStartUs: number | null = null;

  for (let i = windowSize; i <= upperTraceSamples.length; i++) {
    const slice = upperTraceSamples.slice(i - windowSize, i);
    const sliceStd = computeStdDev(slice.map((s) => s.value));
    const tsUs = normalizeTimestampUs(slice[slice.length - 1].timestamp);
    const firstSliceTsUs = normalizeTimestampUs(slice[0].timestamp);

    if (sliceStd <= flatThreshold) {
      if (holdStartUs === null) {
        holdStartUs = firstSliceTsUs || tsUs;
      }
      if (tsUs > holdStartUs) {
        currentHoldUs = tsUs - holdStartUs;
        if (currentHoldUs > maxHoldUs) {
          maxHoldUs = currentHoldUs;
        }
      } else {
        // Fallback if timestamps are synthetic increments
        currentHoldUs += 100_000;
        if (currentHoldUs > maxHoldUs) maxHoldUs = currentHoldUs;
      }
    } else {
      holdStartUs = null;
      currentHoldUs = 0;
    }
  }

  return {
    currentHoldSec: Number((currentHoldUs / 1_000_000).toFixed(1)),
    maxHoldSec: Number((maxHoldUs / 1_000_000).toFixed(1)),
    traceStdDev: Number(overallStdDev.toFixed(4)),
  };
}

/**
 * Counts completed, coherent slow respiratory cycles (inhale peak -> exhale trough)
 * in `upperTrace` for the SignSteady Respiratory Settling Gate.
 */
export function countCoherentBreathCycles(
  upperTraceSamples: readonly SmartSpectraMeasurement[],
  minAmplitude = 0.12
): number {
  if (!upperTraceSamples || upperTraceSamples.length < 10) return 0;

  let cycles = 0;
  let state: 'SEEK_PEAK' | 'SEEK_TROUGH' = 'SEEK_PEAK';
  let localMin = upperTraceSamples[0].value;
  let localMax = upperTraceSamples[0].value;

  for (const sample of upperTraceSamples) {
    const v = sample.value;
    if (state === 'SEEK_PEAK') {
      if (v > localMax) localMax = v;
      if (v < localMin) localMin = v;
      if (localMax - localMin >= minAmplitude && v < localMax - minAmplitude * 0.4) {
        state = 'SEEK_TROUGH';
        localMin = v;
      }
    } else {
      if (v < localMin) localMin = v;
      if (localMax - localMin >= minAmplitude && v > localMin + minAmplitude * 0.4) {
        cycles += 1;
        state = 'SEEK_PEAK';
        localMax = v;
      }
    }
  }

  return cycles;
}

/**
 * Extracts a 0-100 facial cognitive tension index from SmartSpectra `face.expression` scores.
 * Combines ANGRY (1 - brow furrow), CONTEMPT (2), DISGUST (3 - nose/brow squint), and FEAR (4).
 */
export function computeExpressionTension(expressionSample?: SmartSpectraExpression): number {
  if (!expressionSample || !expressionSample.scores || expressionSample.scores.length === 0) {
    return 0;
  }
  let tensionSum = 0;
  for (const s of expressionSample.scores) {
    // 1=ANGRY (brow furrow during concentrated reading), 2=CONTEMPT, 3=DISGUST, 4=FEAR
    if (s.type === 1 || s.type === 2 || s.type === 3 || s.type === 4) {
      tensionSum += Math.max(0, s.confidence || 0);
    }
  }
  return Math.min(100, Number(tensionSum.toFixed(1)));
}

/**
 * Evaluates whether the user's face landmarks are centered and oriented toward the viewport.
 * SmartSpectra outputs up to 478 MediaPipe-indexed 2D landmarks.
 */
export function evaluateFaceFraming(landmarksSample?: SmartSpectraLandmarks): {
  faceCentered: boolean;
  landmarkCount: number;
  centroidX: number | null;
  centroidY: number | null;
} {
  const pts = landmarksSample?.value;
  if (!pts || pts.length === 0) {
    return { faceCentered: false, landmarkCount: 0, centroidX: null, centroidY: null };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Handle both normalized [0..1] coordinates and pixel [0..640/1280] coordinates
  const isNormalized = maxX <= 2.0 && maxY <= 2.0;
  const centered = isNormalized
    ? cx >= 0.18 && cx <= 0.82 && cy >= 0.12 && cy <= 0.88 && width >= 0.08
    : width >= 45 && height >= 45;

  return {
    faceCentered: Boolean(landmarksSample?.stable !== false && centered),
    landmarkCount: pts.length,
    centroidX: Number(cx.toFixed(2)),
    centroidY: Number(cy.toFixed(2)),
  };
}
