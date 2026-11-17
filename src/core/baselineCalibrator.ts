/**
 * Personal Baseline Calibrator (30-Second Stationary Reference Window)
 *
 * Per Presage SmartSpectra Model Cards, physiological signals (especially HRV Baevsky Index,
 * respiratory trace amplitude, and resting pulse rate) must be interpreted relative to a
 * subject's own stationary baseline rather than arbitrary population averages.
 */

import {
  computeExpressionTension,
  computeIqr,
  computeMedian,
  computeStdDev,
} from './signalMath';
import { DecodedSmartSpectraMetrics, PersonalBaseline } from './types';

export interface BaselineAccumulatorState {
  startedAtMs: number;
  pulseValues: readonly number[];
  breathingValues: readonly number[];
  upperTraceValues: readonly number[];
  expressionScores: readonly number[];
  edaValues: readonly number[];
  hrvRmssdValues: readonly number[];
  hrvBaevskyValues: readonly number[];
  blinkTimestampsMs: readonly number[];
  wasBlinkingLastPacket: boolean;
  totalPackets: number;
  talkingPackets: number;
}

export function createBaselineAccumulator(nowMs = Date.now()): BaselineAccumulatorState {
  return {
    startedAtMs: nowMs,
    pulseValues: [],
    breathingValues: [],
    upperTraceValues: [],
    expressionScores: [],
    edaValues: [],
    hrvRmssdValues: [],
    hrvBaevskyValues: [],
    blinkTimestampsMs: [],
    wasBlinkingLastPacket: false,
    totalPackets: 0,
    talkingPackets: 0,
  };
}

/**
 * Purely folds a new decoded SmartSpectra metrics packet into the baseline accumulator,
 * respecting Model Card confidence thresholds and talking gates.
 */
export function ingestBaselinePacket(
  state: BaselineAccumulatorState,
  metrics: DecodedSmartSpectraMetrics,
  nowMs = Date.now()
): BaselineAccumulatorState {
  const talkingArr = metrics.face?.talking ?? [];
  const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);

  // If the user is talking during baseline calibration, record talking ratio and skip breathing/pulse samples
  if (isTalking) {
    return {
      ...state,
      totalPackets: state.totalPackets + 1,
      talkingPackets: state.talkingPackets + 1,
    };
  }

  const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
  const newPulses = pulseArr
    .filter((p) => p.value >= 40 && p.value <= 140 && (p.confidence === undefined || p.confidence >= 40))
    .map((p) => p.value);

  const breathArr = metrics.breathing?.rate ?? [];
  const newBreaths = breathArr
    .filter((b) => b.value >= 5 && b.value <= 40 && (b.confidence === undefined || b.confidence >= 45))
    .map((b) => b.value);

  const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
  const newUpper = upperArr.filter((u) => Number.isFinite(u.value)).map((u) => u.value);

  const exprArr = metrics.face?.expression ?? [];
  const newExpr =
    exprArr.length > 0 ? [computeExpressionTension(exprArr[exprArr.length - 1])] : [];

  const edaArr = metrics.eda?.trace ?? [];
  const newEda = edaArr.filter((e) => Number.isFinite(e.value)).map((e) => e.value);

  const hrvArr = metrics.cardio?.hrv ?? [];
  const validHrv = hrvArr.filter((h) => h.confidence === undefined || h.confidence >= 50);
  const newRmssd = validHrv.map((h) => h.rmssd).filter((v): v is number => typeof v === 'number' && v > 0);
  const newBaevsky = validHrv.map((h) => h.baevsky).filter((v): v is number => typeof v === 'number' && v > 0);

  const blinkArr = metrics.face?.blinking ?? [];
  const isBlinkingNow = blinkArr.length > 0 && Boolean(blinkArr[blinkArr.length - 1]?.detected);
  const newBlinkTs =
    isBlinkingNow && !state.wasBlinkingLastPacket
      ? [...state.blinkTimestampsMs, nowMs]
      : state.blinkTimestampsMs;

  return {
    ...state,
    pulseValues: [...state.pulseValues, ...newPulses],
    breathingValues: [...state.breathingValues, ...newBreaths],
    upperTraceValues: [...state.upperTraceValues, ...newUpper].slice(-900),
    expressionScores: [...state.expressionScores, ...newExpr],
    edaValues: [...state.edaValues, ...newEda],
    hrvRmssdValues: [...state.hrvRmssdValues, ...newRmssd],
    hrvBaevskyValues: [...state.hrvBaevskyValues, ...newBaevsky],
    blinkTimestampsMs: newBlinkTs,
    wasBlinkingLastPacket: isBlinkingNow,
    totalPackets: state.totalPackets + 1,
  };
}

/**
 * Finalizes the 30-second calibration into an immutable `PersonalBaseline` reference.
 */
export function finalizePersonalBaseline(
  state: BaselineAccumulatorState,
  nowMs = Date.now()
): PersonalBaseline {
  const durationSec = Math.max(1, Number(((nowMs - state.startedAtMs) / 1000).toFixed(1)));
  const pulseMedianBpm = computeMedian(state.pulseValues);
  const pulseIqrBpm = computeIqr(state.pulseValues);
  const breathingMedianBrpm = computeMedian(state.breathingValues);
  const upperTraceStdDev = Math.max(0.12, computeStdDev(state.upperTraceValues));
  const blinkRatePerMin = Number(((state.blinkTimestampsMs.length / durationSec) * 60).toFixed(1));
  const expressionTensionMedian = computeMedian(state.expressionScores) ?? 8.0;
  const edaMedian = computeMedian(state.edaValues);
  const hrvRmssdMs = computeMedian(state.hrvRmssdValues);
  const hrvBaevskyIndex = computeMedian(state.hrvBaevskyValues);
  const talkingRatio =
    state.totalPackets > 0 ? Number((state.talkingPackets / state.totalPackets).toFixed(2)) : 0;

  const hasEnoughSamples = state.upperTraceValues.length >= 15 || state.pulseValues.length >= 2;

  return {
    calibratedAtIso: new Date(nowMs).toISOString(),
    durationSec,
    pulseMedianBpm: pulseMedianBpm !== null ? Number(pulseMedianBpm.toFixed(1)) : null,
    pulseIqrBpm: Number(pulseIqrBpm.toFixed(2)),
    breathingMedianBrpm: breathingMedianBrpm !== null ? Number(breathingMedianBrpm.toFixed(1)) : null,
    upperTraceStdDev: Number(upperTraceStdDev.toFixed(4)),
    blinkRatePerMin,
    expressionTensionMedian: Number(expressionTensionMedian.toFixed(1)),
    edaMedian: edaMedian !== null ? Number(edaMedian.toFixed(3)) : null,
    hrvRmssdMs: hrvRmssdMs !== null ? Number(hrvRmssdMs.toFixed(1)) : null,
    hrvBaevskyIndex: hrvBaevskyIndex !== null ? Number(hrvBaevskyIndex.toFixed(1)) : null,
    sampleCount: state.upperTraceValues.length + state.pulseValues.length,
    talkingRatio,
    valid: hasEnoughSamples && talkingRatio < 0.35,
  };
}
