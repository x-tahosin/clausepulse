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
} from '../src/core/clauseEngine';
import {
  BUILTIN_DOCUMENT_PRESETS,
  parseCustomDocumentIntoClauses,
  parseGitDiffIntoPreset,
} from '../src/core/documents';
import {
  computeApneaHoldSeconds,
  computeExpressionTension,
  computeIqr,
  computeMedian,
  computeStdDev,
  normalizeTimestampUs,
} from '../src/core/signalMath';
import { DecodedSmartSpectraMetrics } from '../src/core/types';

describe('Stage 5 Stress, Edge-Case, Resilience & Security Verification Suite', () => {
  it('normalizes all ProtobufTimestamp variants (number, bigint, Long object, null)', () => {
    expect(normalizeTimestampUs(1_500_000)).toBe(1_500_000);
    expect(normalizeTimestampUs(BigInt(2_500_000))).toBe(2_500_000);
    expect(normalizeTimestampUs({ toNumber: () => 3_500_000 })).toBe(3_500_000);
    expect(normalizeTimestampUs(null)).toBe(0);
    expect(normalizeTimestampUs(undefined)).toBe(0);
  });

  it('survives NaN, Infinity, negative confidence, and empty protobuf arrays without NaN leakage', () => {
    expect(computeMedian([NaN, Infinity, -Infinity])).toBeNull();
    expect(computeMedian([NaN, 70, Infinity, 80])).toBe(75);
    expect(computeIqr([NaN, 70])).toBe(1.5);
    expect(computeStdDev([NaN, 10])).toBe(0);
    expect(
      computeExpressionTension({
        scores: [
          { type: 1, confidence: -50 },
          { type: 2, confidence: 150 },
        ],
      })
    ).toBe(100);

    const clauses = BUILTIN_DOCUMENT_PRESETS[0].clauses;
    let session = createDocumentSession(clauses, 1000);
    let baselineAcc = createBaselineAccumulator(1000);

    const malformedPacket: DecodedSmartSpectraMetrics = {
      breathing: {
        rate: [
          { value: NaN, confidence: 95, stable: true },
          { value: 999, confidence: 95, stable: true }, // Out of [5..40] range
          { value: 15, confidence: 20, stable: false }, // Below 45 confidence floor
        ],
        upperTrace: [
          { value: NaN, timestamp: 1000 },
          { value: Infinity, timestamp: 2000 },
        ],
      },
      cardio: {
        pulseRate: [
          { value: -10, confidence: 90 },
          { value: 72, confidence: 15 }, // Below 40 confidence floor
        ],
        hrv: [{ rmssd: -5, baevsky: NaN, confidence: 10 }],
      },
      face: {
        landmarks: [{ value: [], stable: true }],
        expression: [{ scores: [] }],
      },
      eda: {
        trace: [{ value: NaN }],
      },
    };

    baselineAcc = ingestBaselinePacket(baselineAcc, malformedPacket, 1200);
    const finalizedBase = finalizePersonalBaseline(baselineAcc, 2000);
    expect(finalizedBase.pulseMedianBpm).toBeNull();
    expect(finalizedBase.breathingMedianBrpm).toBeNull();
    expect(Number.isFinite(finalizedBase.upperTraceStdDev)).toBe(true);

    session = ingestMetricsForActiveClause(session, malformedPacket, true, null, 1200, 200);
    session = finalizeCurrentClause(session, null, 1400);
    const rec = session.records[clauses[0].id];
    expect(rec.pulseMeanBpm).toBeNull();
    expect(rec.breathingMeanBrpm).toBeNull();
    expect(Number.isNaN(rec.gazePresenceRatio)).toBe(false);
    expect(Number.isNaN(rec.maxApneaHoldSec)).toBe(false);
  });

  it('maintains exact linear dwell time conservation across 60 rapid clause focus switches', () => {
    const clauses = BUILTIN_DOCUMENT_PRESETS[0].clauses;
    let session = createDocumentSession(clauses, 10_000);
    let nowMs = 10_000;

    for (let step = 1; step <= 60; step++) {
      nowMs += 100;
      session = ingestMetricsForActiveClause(
        session,
        {
          breathing: {
            rate: [{ value: 14, confidence: 85, stable: true, timestamp: nowMs * 1000 }],
            upperTrace: [{ value: Math.sin(step * 0.3) * 0.4, stable: true, timestamp: nowMs * 1000 }],
          },
          face: {
            landmarks: [
              {
                value: [
                  { x: 0.45, y: 0.45 },
                  { x: 0.55, y: 0.55 },
                ],
                stable: true,
              },
            ],
            talking: [{ detected: false, stable: true }],
          },
        },
        true,
        null,
        nowMs,
        100
      );

      // Switch clause every 3 ticks (300ms per visit)
      if (step % 3 === 0) {
        const nextClause = clauses[(step / 3) % clauses.length];
        session = selectActiveClause(session, nextClause.id, null, nowMs);
      }
    }

    session = finalizeCurrentClause(session, null, nowMs);

    const totalDwellAcrossAllClauses = Object.values(session.records).reduce(
      (sum, r) => sum + r.dwellTimeMs,
      0
    );
    // 60 ticks * 100ms = exactly 6000ms total dwell time (no quadratic inflation!)
    expect(totalDwellAcrossAllClauses).toBe(6000);

    for (const r of Object.values(session.records)) {
      expect(r.passHistory.length).toBeLessThanOrEqual(6);
    }
  });

  it('recovers from SIGNAL_UNVERIFIED (speech pause on Pass 1) to VERIFIED_CALM when re-read silently on Pass 2', () => {
    const clauses = BUILTIN_DOCUMENT_PRESETS[2].clauses; // Consent form
    let session = createDocumentSession(clauses, 0);

    // Pass 1: Read Clause 1 (`con-1`, minRequiredDwellMs = 6500ms) for 7.0s while talking aloud
    for (let i = 1; i <= 70; i++) {
      const nowMs = i * 100;
      session = ingestMetricsForActiveClause(
        session,
        {
          breathing: {
            rate: [{ value: 16, confidence: 30, stable: false }],
            upperTrace: [{ value: Math.sin(i) * 0.7, stable: false }],
          },
          face: {
            talking: [{ detected: true, stable: true }],
            landmarks: [
              {
                value: [
                  { x: 0.44, y: 0.44 },
                  { x: 0.56, y: 0.56 },
                ],
                stable: true,
              },
            ],
          },
        },
        true,
        null,
        nowMs,
        100
      );
    }

    session = finalizeCurrentClause(session, null, 7000);
    expect(session.records['con-1'].status).toBe('SIGNAL_UNVERIFIED');
    expect(session.records['con-1'].passHistory[0].status).toBe('SIGNAL_UNVERIFIED');

    // Pass 2: Re-read `con-1` silently for 3.0s with centered gaze and calm breathing
    for (let i = 71; i <= 105; i++) {
      const nowMs = i * 100;
      session = ingestMetricsForActiveClause(
        session,
        {
          breathing: {
            rate: [{ value: 14, confidence: 88, stable: true, timestamp: nowMs * 1000 }],
            upperTrace: [
              {
                value: Math.sin((i / 10) * 2 * Math.PI * 0.23) * 0.42,
                stable: true,
                timestamp: nowMs * 1000,
              },
            ],
          },
          cardio: {
            pulseRate: [{ value: 70, confidence: 90, stable: true, timestamp: nowMs * 1000 }],
          },
          face: {
            talking: [{ detected: false, stable: true }],
            landmarks: [
              {
                value: [
                  { x: 0.44, y: 0.44 },
                  { x: 0.56, y: 0.56 },
                ],
                stable: true,
              },
            ],
          },
        },
        true,
        null,
        nowMs,
        100
      );
    }

    session = finalizeCurrentClause(session, null, 10_500);
    expect(session.records['con-1'].status).toBe('VERIFIED_CALM');
    expect(session.records['con-1'].passHistory.length).toBe(2);
    expect(session.records['con-1'].passHistory[1].status).toBe('VERIFIED_CALM');
  });

  it('automatically classifies code/diff blocks and handles XSS strings safely', () => {
    const rawInput = `Section 1: <script>alert("xss")</script>
@@ -1,3 +1,4 @@
-const SAFE = true;
+eval(userControlledPayload);
+DROP TABLE production_users;`;

    const parsed = parseCustomDocumentIntoClauses('XSS & SQL Test <img onerror=alert(1)>', rawInput);
    expect(parsed.clauses.length).toBe(1);
    expect(parsed.clauses[0].isCodeOrDiff).toBe(true);
    expect(parsed.clauses[0].riskTier).toBe('CRITICAL_TRAP');
    expect(parsed.sourceHashSha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
