import { describe, expect, it } from 'vitest';
import {
  createBaselineAccumulator,
  finalizePersonalBaseline,
  ingestBaselinePacket,
} from '../src/core/baselineCalibrator';
import {
  computeDocumentSignOffSummary,
  createDocumentSession,
  finalizeCurrentClause,
  ingestMetricsForActiveClause,
  selectActiveClause,
  startSettlingGate,
} from '../src/core/clauseEngine';
import {
  BUILTIN_DOCUMENT_PRESETS,
  parseCustomDocumentIntoClauses,
} from '../src/core/documents';
import {
  buildReadReceiptPayload,
  formatReadReceiptMarkdown,
} from '../src/core/receiptExporter';
import { generateReplayMetricsSlice } from '../src/core/replayFixtures';
import {
  computeApneaHoldSeconds,
  computeMedian,
  countCoherentBreathCycles,
  evaluateFaceFraming,
} from '../src/core/signalMath';

describe('ClausePulse Signal Math & SmartSpectra Protobuf Helpers', () => {
  it('computes accurate median for odd and even sample arrays', () => {
    expect(computeMedian([72, 68, 75, 70, 71])).toBe(71);
    expect(computeMedian([70, 72, 74, 76])).toBe(73);
    expect(computeMedian([])).toBeNull();
  });

  it('detects reading apnea when upperTrace flatlines for >= 4.5s while silent', () => {
    const samples = [];
    for (let i = 0; i < 60; i++) {
      samples.push({
        value: 0.005 * Math.sin(i),
        stable: true,
        timestamp: 1_000_000 + i * 100_000, // 100ms steps = 6.0s total
      });
    }
    const res = computeApneaHoldSeconds(samples, 0.4, false);
    expect(res.maxHoldSec).toBeGreaterThanOrEqual(4.5);

    // When talking is true, Model Card speech gate must suppress apnea detection
    const gated = computeApneaHoldSeconds(samples, 0.4, true);
    expect(gated.maxHoldSec).toBe(0);
  });

  it('counts coherent respiratory cycles for SignSteady settling gate', () => {
    const samples = [];
    // Generate 2.5 full sine wave cycles (period = 20 samples)
    for (let i = 0; i < 55; i++) {
      samples.push({
        value: Math.sin((i / 20) * 2 * Math.PI) * 0.6,
        stable: true,
        timestamp: i * 200_000,
      });
    }
    const cycles = countCoherentBreathCycles(samples, 0.12);
    expect(cycles).toBeGreaterThanOrEqual(2);
  });

  it('evaluates face landmark centering correctly', () => {
    const centered = evaluateFaceFraming({
      stable: true,
      value: [
        { x: 0.4, y: 0.35 },
        { x: 0.6, y: 0.35 },
        { x: 0.5, y: 0.55 },
      ],
    });
    expect(centered.faceCentered).toBe(true);

    const offScreen = evaluateFaceFraming({
      stable: true,
      value: [
        { x: 0.02, y: 0.03 },
        { x: 0.05, y: 0.04 },
      ],
    });
    expect(offScreen.faceCentered).toBe(false);
  });
});

describe('ClausePulse Attribution Engine & Model Card Gates', () => {
  it('calibrates a 30s personal baseline and ignores packets where face.talking is true', () => {
    let acc = createBaselineAccumulator(1000);
    for (let i = 1; i <= 30; i++) {
      const slice = generateReplayMetricsSlice('CALM_STEADY_READER', i, i * 1_000_000);
      acc = ingestBaselinePacket(acc, slice, 1000 + i * 1000);
    }
    const baseline = finalizePersonalBaseline(acc, 31_000);
    expect(baseline.valid).toBe(true);
    expect(baseline.pulseMedianBpm).toBeCloseTo(70.2, 1);
    expect(baseline.breathingMedianBrpm).toBeCloseTo(13.8, 1);
  });

  it('flags SKIM_DETECTED when advancing before minRequiredDwellMs and VERIFIED_CALM when read calmly', () => {
    const preset = BUILTIN_DOCUMENT_PRESETS[0];
    let session = createDocumentSession(preset.clauses, 0);

    // Skim Clause 1 after only 800ms
    const calmPacket = generateReplayMetricsSlice('CALM_STEADY_READER', 1, 1_000_000);
    session = ingestMetricsForActiveClause(session, calmPacket, true, null, 800);
    session = selectActiveClause(session, 'msa-2', null, 900);

    expect(session.records['msa-1'].status).toBe('SKIM_DETECTED');

    // Now read Clause 2 calmly across its full required dwell window (8 seconds)
    for (let t = 1000; t <= 9500; t += 500) {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', t / 1000, t * 1000);
      session = ingestMetricsForActiveClause(session, pkt, true, null, t);
    }
    session = finalizeCurrentClause(session, null, 9600);
    expect(session.records['msa-2'].status).toBe('VERIFIED_CALM');
  });

  it('flags APNEA_FRICTION on breath-hold + pulse spike and unlocks via SignSteady settling breaths', () => {
    const preset = BUILTIN_DOCUMENT_PRESETS[0];
    let session = createDocumentSession(preset.clauses, 0);

    // Calibrate baseline at 70 BPM
    let acc = createBaselineAccumulator(0);
    for (let i = 1; i <= 20; i++) {
      acc = ingestBaselinePacket(
        acc,
        generateReplayMetricsSlice('CALM_STEADY_READER', i, i * 1_000_000),
        i * 500
      );
    }
    const baseline = finalizePersonalBaseline(acc, 10_000);

    // Select Clause 3 (Critical IP Trap) and feed APNEA_AND_PULSE_SPIKE for 11 seconds
    session = selectActiveClause(session, 'msa-3', baseline, 10_000);
    for (let step = 1; step <= 55; step++) {
      const nowMs = 10_000 + step * 200;
      const pkt = generateReplayMetricsSlice('APNEA_AND_PULSE_SPIKE', step * 0.2, nowMs * 1000);
      session = ingestMetricsForActiveClause(session, pkt, true, baseline, nowMs);
    }
    session = finalizeCurrentClause(session, baseline, 21_200);
    expect(session.records['msa-3'].status).toBe('APNEA_FRICTION');

    // Open SignSteady Respiratory Settling Gate and feed coherent breathing cycles
    session = startSettlingGate(session, 'msa-3');
    for (let step = 1; step <= 80; step++) {
      const nowMs = 22_000 + step * 150;
      const pkt = generateReplayMetricsSlice('COHERENT_SETTLING_BREATH', step * 0.15, nowMs * 1000);
      session = ingestMetricsForActiveClause(session, pkt, true, baseline, nowMs);
    }
    expect(session.records['msa-3'].status).toBe('SETTLED_OVERRIDE');
    expect(session.records['msa-3'].settledCyclesCompleted).toBeGreaterThanOrEqual(2);
  });

  it('parses custom documents and exports an integrity-hashed Read Receipt', () => {
    const custom = parseCustomDocumentIntoClauses(
      'Custom SLA',
      'Clause 1: Standard Uptime\nWe provide 99.9% uptime across all endpoints with daily backups.\n\nClause 2: Indemnification\nCustomer agrees to unlimited liability and irrevocable assignment of background IP.'
    );
    expect(custom.clauses.length).toBe(2);
    expect(custom.clauses[1].riskTier).toBe('CRITICAL_TRAP');

    const session = createDocumentSession(custom.clauses, 1000);
    const receipt = buildReadReceiptPayload(
      custom,
      session,
      null,
      'DETERMINISTIC_REPLAY_BENCH',
      false,
      '3.5.0',
      2000
    );
    expect(receipt.integrityDigestHex).toMatch(/^sha256:[0-9a-f]{64}$/);
    const md = formatReadReceiptMarkdown(receipt);
    expect(md).toContain('ClausePulse Physiological Read Receipt');
    expect(md).toContain(receipt.integrityDigestHex);
    const summary = computeDocumentSignOffSummary(session);
    expect(summary.canSignOff).toBe(false);
  });
});
