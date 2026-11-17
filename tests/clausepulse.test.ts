import * as crypto from 'crypto';
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
  classifyClauseRisk,
  parseCustomDocumentIntoClauses,
  parseGitDiffIntoPreset,
} from '../src/core/documents';
import { runEvaluationBenchmarkSuite } from '../src/core/evalHarness';
import {
  buildReadReceiptPayload,
  computeReceiptDigest,
  formatReadReceiptMarkdown,
} from '../src/core/receiptExporter';
import { generateReplayMetricsSlice } from '../src/core/replayFixtures';
import { sha256Hex } from '../src/core/sha256';
import {
  computeApneaHoldSeconds,
  countCoherentBreathCycles,
  evaluateFaceFraming,
} from '../src/core/signalMath';

describe('ClausePulse v2.0 Core Cryptographic, Physiological & Ablation Suite', () => {
  it('computes genuine RFC 6234 SHA-256 hex digests matching Node crypto.createHash("sha256")', () => {
    const vectors = [
      '',
      'hello',
      'ClausePulse Physiological Read Receipt v2.0 — Presage SmartSpectra SDK',
      '{"clause":"§ 3.2","status":"APNEA_FRICTION","dwell":10.5,"utf8":"বাংলা ও English ✓"}',
      'a'.repeat(1000),
    ];

    for (const vec of vectors) {
      const expected = crypto.createHash('sha256').update(vec, 'utf8').digest('hex');
      expect(sha256Hex(vec)).toBe(expected);
      expect(computeReceiptDigest(vec)).toBe(`sha256:${expected}`);
    }
  });

  it('strictly rejects zero-landmark frames (Defect C regression test: 0 landmarks = 0% gaze)', () => {
    const clauses = BUILTIN_DOCUMENT_PRESETS[0].clauses;
    let session = createDocumentSession(clauses, 1000);

    // Feed 8 seconds of valid dwell time, but with empty landmarks array (user walked away)
    for (let i = 1; i <= 80; i++) {
      const nowMs = 1000 + i * 100;
      session = ingestMetricsForActiveClause(
        session,
        {
          breathing: {
            rate: [{ value: 14, confidence: 85, stable: true, timestamp: nowMs * 1000 }],
            upperTrace: [{ value: Math.sin(i * 0.2) * 0.4, stable: true, timestamp: nowMs * 1000 }],
          },
          cardio: {
            pulseRate: [{ value: 70, confidence: 88, stable: true, timestamp: nowMs * 1000 }],
          },
          face: {
            landmarks: [], // 0 landmarks
            talking: [{ detected: false, stable: true, timestamp: nowMs * 1000 }],
          },
        },
        true,
        null,
        nowMs,
        100
      );
    }

    session = finalizeCurrentClause(session, null, 9000);
    const rec = session.records[clauses[0].id];
    expect(rec.dwellTimeMs).toBeGreaterThanOrEqual(7500);
    expect(rec.gazePresenceRatio).toBe(0);
    expect(rec.status).toBe('SKIM_DETECTED');
  });

  it('detects reading apnea from flatlined upperTrace and unlocks via 2 coherent breath cycles with Pass-1 vs Pass-2 history', () => {
    const clauses = BUILTIN_DOCUMENT_PRESETS[0].clauses;
    let session = createDocumentSession(clauses, 10_000);

    // Calibrate a 70 BPM / 14 BRPM baseline
    let acc = createBaselineAccumulator(0);
    for (let i = 1; i <= 50; i++) {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', i * 0.1, i * 100_000);
      acc = ingestBaselinePacket(acc, pkt, i * 100);
    }
    const baseline = finalizePersonalBaseline(acc, 5000);
    expect(baseline.valid).toBe(true);
    expect(baseline.pulseMedianBpm).toBeCloseTo(70.2, 1);

    // Switch to Clause 3 (Critical IP Trap) and feed 11 seconds of APNEA_AND_PULSE_SPIKE
    session = selectActiveClause(session, 'msa-3', baseline, 10_000);
    for (let i = 1; i <= 110; i++) {
      const nowMs = 10_000 + i * 100;
      const pkt = generateReplayMetricsSlice('APNEA_AND_PULSE_SPIKE', i * 0.1, nowMs * 1000);
      session = ingestMetricsForActiveClause(session, pkt, true, baseline, nowMs, 100);
    }

    session = finalizeCurrentClause(session, baseline, 21_000);
    const pass1Rec = session.records['msa-3'];
    expect(pass1Rec.status).toBe('APNEA_FRICTION');
    expect(pass1Rec.maxApneaHoldSec).toBeGreaterThanOrEqual(4.5);
    expect(pass1Rec.passHistory.length).toBe(1);
    expect(pass1Rec.passHistory[0].status).toBe('APNEA_FRICTION');

    // Open SignSteady Settling Gate and stream coherent breathing until unlocked
    session = startSettlingGate(session, 'msa-3');
    for (let i = 1; i <= 90; i++) {
      const nowMs = 21_000 + i * 100;
      const pkt = generateReplayMetricsSlice('COHERENT_SETTLING_BREATH', i * 0.1, nowMs * 1000);
      session = ingestMetricsForActiveClause(session, pkt, true, baseline, nowMs, 100);
      if (session.records['msa-3'].status === 'SETTLED_OVERRIDE') break;
    }

    const pass2Rec = session.records['msa-3'];
    expect(pass2Rec.status).toBe('SETTLED_OVERRIDE');
    expect(pass2Rec.settledCyclesCompleted).toBeGreaterThanOrEqual(2);
    expect(pass2Rec.passHistory.length).toBe(2);
    expect(pass2Rec.passHistory[1].status).toBe('SETTLED_OVERRIDE');
  });

  it('parses unified Git diffs and SQL migrations into risk-classified clauses', () => {
    const sampleDiff = `diff --git a/migrations/004_drop_staging.sql b/migrations/004_drop_staging.sql
index 1122334..5566778 100644
--- a/migrations/004_drop_staging.sql
+++ b/migrations/004_drop_staging.sql
@@ -1,4 +1,6 @@
 -- Promote primary and purge staging
+DROP TABLE ledger_staging_unverified CASCADE;
+TRUNCATE TABLE audit_temp_log;
 SELECT 1;`;

    const preset = parseGitDiffIntoPreset('ledger-service', 'main', sampleDiff, '/repo/ledger');
    expect(preset.documentType).toBe('GIT_DIFF');
    expect(preset.clauses.length).toBe(1);
    expect(preset.clauses[0].isCodeOrDiff).toBe(true);
    expect(preset.clauses[0].riskTier).toBe('CRITICAL_TRAP');
    expect(preset.clauses[0].plainLanguageWarning).toMatch(/DESTRUCTIVE SQL/i);

    const customDoc = parseCustomDocumentIntoClauses(
      'Vendor Terms',
      'Section 1\nContractor agrees to unlimited liability and waives background IP.\n\nSection 2\nStandard 30-day notice.',
      '/tmp/vendor.md'
    );
    expect(customDoc.clauses.length).toBe(2);
    expect(customDoc.clauses[0].riskTier).toBe('CRITICAL_TRAP');
    expect(classifyClauseRisk('Drop', 'rm -rf / --no-verify').riskTier).toBe('CRITICAL_TRAP');
  });

  it('runs the 30-scenario evaluation benchmark and proves multi-signal fusion outperforms naive baselines', () => {
    const summary = runEvaluationBenchmarkSuite();
    expect(summary.totalCases).toBe(30);
    // ClausePulse achieves 28/30 (93.3%), with 2 documented physical boundary cases (E29, E30)
    expect(summary.clausePulseCorrect).toBe(28);
    expect(summary.clausePulseAccuracyPct).toBeCloseTo(93.3, 1);
    // Naive Dwell Timer and Uncalibrated Pulse Gate perform significantly worse
    expect(summary.clausePulseAccuracyPct).toBeGreaterThan(summary.naiveTimerAccuracyPct + 40);
    expect(summary.clausePulseAccuracyPct).toBeGreaterThan(
      summary.uncalibratedPulseAccuracyPct + 25
    );
    // Speech Gate eliminates false positives during vocalization (0% vs 75%)
    expect(summary.speechFalsePositiveRateClausePulsePct).toBe(0);
    expect(summary.speechFalsePositiveRateUncalibratedPct).toBeGreaterThanOrEqual(75);
  });

  it('generates a complete ReadReceiptPayload with RFC 6234 SHA-256 digest and Git commit trailer', () => {
    const preset = BUILTIN_DOCUMENT_PRESETS[2];
    const session = createDocumentSession(preset.clauses, 1000);
    const receipt = buildReadReceiptPayload(
      preset,
      session,
      null,
      'LIVE_WEBCAM_OPTICAL',
      false,
      '3.5.0',
      2000
    );

    expect(receipt.integrityDigestHex).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(receipt.gitCommitTrailer).toContain('Attested-By-ClausePulse:');
    const md = formatReadReceiptMarkdown(receipt);
    expect(md).toContain(receipt.integrityDigestHex);
    expect(md).toContain(receipt.gitCommitTrailer);
  });

  it('accurately counts coherent breath cycles and evaluates face landmark framing', () => {
    const wave = [];
    for (let i = 0; i < 80; i++) {
      wave.push({ value: Math.sin((i / 10) * 2 * Math.PI * 0.35) * 0.5, timestamp: i * 100_000 });
    }
    expect(countCoherentBreathCycles(wave, 0.12)).toBeGreaterThanOrEqual(2);
    expect(computeApneaHoldSeconds([], 0.35, true).currentHoldSec).toBe(0);
    expect(evaluateFaceFraming(undefined).faceCentered).toBe(false);
  });
});
