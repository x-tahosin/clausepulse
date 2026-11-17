/**
 * Auditable Physiological Read Receipt & Cryptographic Git Trailer Generator (v2.0)
 *
 * Exports a transparent, non-medical JSON or Markdown Read Receipt with a genuine
 * RFC 6234 SHA-256 cryptographic digest (`sha256Hex`) and a Git Commit / PR Trailer.
 */

import { computeDocumentSignOffSummary, DocumentSessionState } from './clauseEngine';
import { sha256Hex } from './sha256';
import { DocumentPreset, PersonalBaseline, SignalSourceMode } from './types';

export interface ReadReceiptPayload {
  receiptVersion: '2.0.0';
  generatedAtIso: string;
  document: {
    id: string;
    title: string;
    documentType: string;
    counterpartyOrContext: string;
    sourcePath?: string;
    sourceHashSha256?: string;
    totalClauses: number;
  };
  sensorProvenance: {
    sdkPackage: '@smartspectra/node-sdk';
    sdkVersion: string;
    sourceMode: SignalSourceMode;
    telemetryEnabled: boolean;
    localProcessingOnly: true;
  };
  personalBaseline: PersonalBaseline | null;
  signOffSummary: ReturnType<typeof computeDocumentSignOffSummary>;
  clauseAuditTrail: Array<{
    clauseNumber: string;
    title: string;
    riskTier: string;
    status: string;
    statusReason: string;
    dwellTimeSec: number;
    requiredDwellSec: number;
    gazePresencePct: number;
    pulseMeanBpm: number | null;
    pulseDeltaBpm: number | null;
    breathingMeanBrpm: number | null;
    maxApneaHoldSec: number;
    blinkRatePerMin: number;
    settledCyclesCompleted: number;
    passesRecorded: number;
  }>;
  gitCommitTrailer: string;
  integrityDigestHex: string;
}

/**
 * Computes a genuine 64-character hexadecimal SHA-256 digest of the canonical receipt payload.
 */
export function computeReceiptDigest(canonicalContent: string): string {
  return `sha256:${sha256Hex(canonicalContent)}`;
}

export function buildReadReceiptPayload(
  preset: DocumentPreset,
  session: DocumentSessionState,
  baseline: PersonalBaseline | null,
  sourceMode: SignalSourceMode,
  telemetryEnabled: boolean,
  sdkVersion = '3.5.0',
  nowMs = Date.now()
): ReadReceiptPayload {
  const summary = computeDocumentSignOffSummary(session);
  const trail = preset.clauses.map((c) => {
    const r = session.records[c.id];
    return {
      clauseNumber: c.number,
      title: c.title,
      riskTier: c.riskTier,
      status: r?.status ?? 'UNREAD',
      statusReason: r?.statusReason ?? '',
      dwellTimeSec: Number(((r?.dwellTimeMs ?? 0) / 1000).toFixed(1)),
      requiredDwellSec: Number((c.minRequiredDwellMs / 1000).toFixed(1)),
      gazePresencePct: Math.round((r?.gazePresenceRatio ?? 0) * 100),
      pulseMeanBpm: r?.pulseMeanBpm ?? null,
      pulseDeltaBpm: r?.pulseDeltaBpm ?? null,
      breathingMeanBrpm: r?.breathingMeanBrpm ?? null,
      maxApneaHoldSec: r?.maxApneaHoldSec ?? 0,
      blinkRatePerMin: r?.blinkRatePerMin ?? 0,
      settledCyclesCompleted: r?.settledCyclesCompleted ?? 0,
      passesRecorded: r?.passHistory?.length ?? 0,
    };
  });

  const canonicalDigestInput = JSON.stringify({
    docId: preset.id,
    sourceHashSha256: preset.sourceHashSha256 ?? null,
    sourceMode,
    summary,
    trail,
  });

  const integrityDigestHex = computeReceiptDigest(canonicalDigestInput);
  const shortHash = integrityDigestHex.replace('sha256:', '').slice(0, 16);
  const gitCommitTrailer = `Attested-By-ClausePulse: ${
    summary.canSignOff ? 'VERIFIED' : 'INCOMPLETE'
  } (${summary.verifiedCount}/${summary.totalClauses} clauses, mode=${sourceMode}, sha256=${shortHash})`;

  return {
    receiptVersion: '2.0.0',
    generatedAtIso: new Date(nowMs).toISOString(),
    document: {
      id: preset.id,
      title: preset.title,
      documentType: preset.documentType,
      counterpartyOrContext: preset.counterpartyOrContext,
      sourcePath: preset.sourcePath,
      sourceHashSha256: preset.sourceHashSha256,
      totalClauses: preset.clauses.length,
    },
    sensorProvenance: {
      sdkPackage: '@smartspectra/node-sdk',
      sdkVersion,
      sourceMode,
      telemetryEnabled,
      localProcessingOnly: true,
    },
    personalBaseline: baseline,
    signOffSummary: summary,
    clauseAuditTrail: trail,
    gitCommitTrailer,
    integrityDigestHex,
  };
}

export function formatReadReceiptMarkdown(receipt: ReadReceiptPayload): string {
  const b = receipt.personalBaseline;
  const baselineLine = b
    ? `Pulse Median: ${b.pulseMedianBpm ?? 'N/A'} BPM | Breathing Median: ${b.breathingMedianBrpm ?? 'N/A'} BRPM | Trace SD: ${b.upperTraceStdDev} | Blink Rate: ${b.blinkRatePerMin}/min`
    : 'Uncalibrated session';

  const sourceLine = receipt.document.sourcePath
    ? `\n- **Source File / Repo:** \`${receipt.document.sourcePath}\` (SHA-256: \`${receipt.document.sourceHashSha256?.slice(0, 16) ?? 'N/A'}…\`)`
    : '';

  const rows = receipt.clauseAuditTrail
    .map(
      (c) =>
        `| ${c.clauseNumber} | ${c.title} | ${c.riskTier} | **${c.status}** | ${c.dwellTimeSec}s / ${c.requiredDwellSec}s | ${c.gazePresencePct}% | ${
          c.pulseDeltaBpm !== null ? (c.pulseDeltaBpm >= 0 ? `+${c.pulseDeltaBpm}` : c.pulseDeltaBpm) + ' BPM' : '—'
        } | ${c.maxApneaHoldSec}s |`
    )
    .join('\n');

  return `# ClausePulse Physiological Read Receipt (v2.0)

- **Document:** ${receipt.document.title} (${receipt.document.counterpartyOrContext})${sourceLine}
- **Generated At:** ${receipt.generatedAtIso}
- **Sign-Off Status:** ${receipt.signOffSummary.canSignOff ? 'ATTESTED & VERIFIED' : 'INCOMPLETE / BLOCKED'}
- **Sensor Provenance:** \`${receipt.sensorProvenance.sdkPackage}@${receipt.sensorProvenance.sdkVersion}\` (\`${receipt.sensorProvenance.sourceMode}\`)
- **SDK Telemetry Enabled:** \`${receipt.sensorProvenance.telemetryEnabled}\` (On-device processing only; no raw video uploaded)
- **Personal Baseline (30s):** ${baselineLine}
- **SHA-256 Integrity Digest:** \`${receipt.integrityDigestHex}\`
- **Git / PR Trailer:** \`${receipt.gitCommitTrailer}\`

## Clause-by-Clause Biometric Audit Trail

| Clause | Title | Risk Tier | Verdict | Dwell / Min | Gaze | Pulse Delta | Max Breath-Hold |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---
*Disclaimer: Generated locally by ClausePulse using Presage SmartSpectra SDK. Physiological metrics are relative within-session wellness/interaction estimates and are not medical measurements or diagnoses.*
`;
}
