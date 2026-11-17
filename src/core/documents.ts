/**
 * Document, Local File, SQL Migration, & Git Unified Diff Parser (v2.0)
 *
 * Converts contracts, runbooks, SQL migrations, source files, and live `git diff` output
 * into structured `DocumentClause` blocks with SHA-256 provenance, minimum reading dwell
 * floors, and specific plain-language risk diagnostics.
 */

import { sha256Hex } from './sha256';
import { ClauseRiskTier, DocumentClause, DocumentPreset } from './types';

interface RiskRule {
  pattern: RegExp;
  tier: ClauseRiskTier;
  warning: string;
}

const RISK_RULES: readonly RiskRule[] = [
  {
    pattern: /pre-existing intellectual property|background ip|moral rights in perpetuity/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'CRITICAL IP TRAP: Transfers ownership of pre-existing personal libraries, tools, or background IP to the counterparty permanently.',
  },
  {
    pattern: /unlimited liability|without monetary cap|indemnify.*against any and all/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'CRITICAL LIABILITY TRAP: Uncapped indemnification exposure not limited to fees paid under the contract.',
  },
  {
    pattern: /non-compete|shall not build, advise, or contribute/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'CRITICAL RESTRAINT TRAP: Post-termination industry non-compete restricting future engineering work.',
  },
  {
    pattern: /\b(drop\s+table|drop\s+database|truncate\s+table|delete\s+from\s+\w+\s*;)/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'DESTRUCTIVE SQL OPERATION: Irreversible table/data deletion detected. Verify backup and replication slot state before executing.',
  },
  {
    pattern: /\b(rm\s+-rf|--force|--no-verify|eval\s*\(|dangerouslySetInnerHTML|disable[_-]?auth)/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'CRITICAL CODE / SECURITY RISK: Destructive flag, dynamic code execution, or authentication/verification bypass detected in diff.',
  },
  {
    pattern: /irrevocable.*perpetual.*license|train commercial foundation models/i,
    tier: 'CRITICAL_TRAP',
    warning:
      'CRITICAL DATA RIGHTS TRAP: Grants an irrevocable, perpetual license over customer or proprietary payloads.',
  },
  {
    pattern: /net-90|retainage|withhold.*percent|auto-renew|without notice/i,
    tier: 'ELEVATED',
    warning:
      'ELEVATED FINANCIAL / RENEWAL TERM: Extended payment holdback (Net-90 / retainage) or silent auto-renewal escalation.',
  },
  {
    pattern: /\b(alter\s+table|create\s+index\s+(?!concurrently)|lock\s+table|pgbouncer|wal\s+archive)/i,
    tier: 'ELEVATED',
    warning:
      'ELEVATED INFRASTRUCTURE STEP: Schema lock, connection pool drain, or WAL recovery prerequisite. Verify zero lag.',
  },
  {
    pattern: /arbitration|jurisdiction|confidential|telemetry|license check/i,
    tier: 'ELEVATED',
    warning:
      'ELEVATED COMPLIANCE / PRIVACY TERM: Review governing law, confidentiality scope, or network licensing disclosure.',
  },
];

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

/**
 * Calculates the minimum human reading dwell time in milliseconds for a clause or code hunk.
 * Based on cognitive reading research (~240 WPM fast comprehension ceiling = 250ms/word,
 * with a strict skim floor of 165–210ms/word and a minimum 2,400ms per block).
 */
export function computeMinDwellMs(wordCount: number, riskTier: ClauseRiskTier): number {
  const perWordMs = riskTier === 'CRITICAL_TRAP' ? 210 : riskTier === 'ELEVATED' ? 185 : 165;
  return Math.max(2400, Math.round(wordCount * perWordMs));
}

export function classifyClauseRisk(title: string, body: string): {
  riskTier: ClauseRiskTier;
  plainLanguageWarning?: string;
} {
  const combined = `${title}\n${body}`;
  for (const rule of RISK_RULES) {
    if (rule.pattern.test(combined)) {
      return {
        riskTier: rule.tier,
        plainLanguageWarning: rule.warning,
      };
    }
  }
  return { riskTier: 'STANDARD' };
}

export const BUILTIN_DOCUMENT_PRESETS: readonly DocumentPreset[] = [
  {
    id: 'freelance-msa-2026',
    title: 'Independent Contractor Master Services Agreement (MSA)',
    subtitle: 'Client software development agreement containing 2 buried IP & liability traps',
    documentType: 'CONTRACT',
    counterpartyOrContext: 'Acme Cloud Ventures Inc. — Q4 Engineering Engagement',
    sourcePath: 'presets://contracts/independent-contractor-msa-2026.md',
    sourceHashSha256: sha256Hex('freelance-msa-2026-v2'),
    clauses: [
      {
        id: 'msa-1',
        number: '§ 1.1',
        title: 'Scope of Engineering Deliverables',
        category: 'Deliverables',
        body: 'Contractor agrees to design, implement, and document the customer analytics dashboard module described in Statement of Work #04. All code deliverables shall pass automated continuous integration checks and include setup documentation prior to milestone handoff.',
        wordCount: 36,
        minRequiredDwellMs: 5900,
        riskTier: 'STANDARD',
      },
      {
        id: 'msa-2',
        number: '§ 2.4',
        title: 'Compensation & Net-90 Conditional Payment Holdback',
        category: 'Financial Terms',
        body: 'Client shall remit undisputed invoice amounts within ninety (90) calendar days of final written acceptance ("Net-90"). Client reserves the right to withhold thirty-five percent (35%) of each milestone invoice as a retainage buffer until twelve (12) months after production launch.',
        wordCount: 41,
        minRequiredDwellMs: 7600,
        riskTier: 'ELEVATED',
        plainLanguageWarning:
          'Cash-flow warning: Net-90 payment terms plus a 35% holdback locked for 12 months after launch.',
      },
      {
        id: 'msa-3',
        number: '§ 3.2',
        title: 'Assignment of Pre-Existing & Background Intellectual Property',
        category: 'Intellectual Property',
        body: 'Contractor hereby irrevocably assigns to Client all right, title, and interest worldwide in and to all Deliverables AND any pre-existing libraries, CLI utilities, reusable frameworks, or background intellectual property incorporated into or used during the performance of the Services, waiving all moral rights in perpetuity without additional royalty.',
        wordCount: 48,
        minRequiredDwellMs: 10000,
        riskTier: 'CRITICAL_TRAP',
        plainLanguageWarning:
          'CRITICAL IP TRAP: Transfers ownership of your pre-existing personal libraries and reusable tools to the client forever, not just the work built for this project.',
      },
      {
        id: 'msa-4',
        number: '§ 4.1',
        title: 'Confidentiality & Data Security Boundaries',
        category: 'Security',
        body: 'Both parties agree to hold proprietary credentials, customer records, and architecture specifications in strict confidence using industry-standard encryption at rest and in transit. Neither party shall disclose confidential materials to third-party subcontractors without prior written consent.',
        wordCount: 36,
        minRequiredDwellMs: 5900,
        riskTier: 'STANDARD',
      },
      {
        id: 'msa-5',
        number: '§ 5.3',
        title: 'Unlimited Indemnification & 24-Month Industry Non-Compete',
        category: 'Liability & Restraint',
        body: 'Contractor shall defend and indemnify Client against any and all direct, indirect, or consequential claims without monetary cap (Unlimited Liability). Furthermore, for twenty-four (24) months following termination, Contractor shall not build, advise, or contribute to any software product involving cloud analytics or developer telemetry globally.',
        wordCount: 45,
        minRequiredDwellMs: 9500,
        riskTier: 'CRITICAL_TRAP',
        plainLanguageWarning:
          'CRITICAL LIABILITY & CAREER TRAP: Uncapped financial liability (not limited to fees paid) combined with a 2-year global ban on building analytics or telemetry software.',
      },
    ],
  },
  {
    id: 'prod-cutover-runbook',
    title: 'Production PostgreSQL 17 Primary Shard Cutover Checklist',
    subtitle: 'High-stakes infrastructure migration sign-off before executing primary switchover',
    documentType: 'RUNBOOK',
    counterpartyOrContext: 'Cluster: prod-ledger-us-east-1 • Maintenance Window',
    sourcePath: 'presets://runbooks/pg17-primary-cutover.sql.md',
    sourceHashSha256: sha256Hex('prod-cutover-runbook-v2'),
    clauses: [
      {
        id: 'run-1',
        number: 'STEP 01',
        title: 'Verify Physical WAL Archive & Point-in-Time Recovery Snapshot',
        category: 'Backup Integrity',
        body: 'Confirm that pgBackRest incremental backup completed within the last 15 minutes and that WAL segment archiving to immutable object storage shows zero lag before touching replica configuration.',
        wordCount: 28,
        minRequiredDwellMs: 5200,
        riskTier: 'ELEVATED',
        plainLanguageWarning:
          'Verify WAL archive lag is 0 bytes before proceeding; without this, point-in-time recovery is impossible.',
      },
      {
        id: 'run-2',
        number: 'STEP 02',
        title: 'Drain PgBouncer Connection Pools & Fence Write Traffic',
        category: 'Traffic Fencing',
        body: 'Issue PAUSE on all read-write PgBouncer pools and set default_transaction_read_only = on across the old primary node to prevent split-brain writes during replication catch-up.',
        wordCount: 26,
        minRequiredDwellMs: 4800,
        riskTier: 'STANDARD',
      },
      {
        id: 'run-3',
        number: 'STEP 03',
        title: 'Irreversible Legacy Slot Purge & Old Primary Demotion',
        category: 'Destructive Cutover',
        body: 'Promote standby node-02 to primary, immediately drop the legacy replication slot, and execute destructive storage trim on old-primary scratch tables (DROP TABLE ledger_staging_unverified CASCADE). This operation is irreversible once committed.',
        isCodeOrDiff: true,
        wordCount: 31,
        minRequiredDwellMs: 6600,
        riskTier: 'CRITICAL_TRAP',
        plainLanguageWarning:
          'IRREVERSIBLE STEP: Dropping the replication slot and staging table permanently destroys unpromoted rows on old-primary.',
      },
      {
        id: 'run-4',
        number: 'STEP 04',
        title: 'Post-Cutover Checksum & Canary Transaction Verification',
        category: 'Verification',
        body: 'Run synthetic canary transfer #001, verify sequence monotonic increments match pre-cutover high-water marks, and resume PgBouncer pools only after error rates remain below 0.01% for 180 seconds.',
        wordCount: 28,
        minRequiredDwellMs: 5000,
        riskTier: 'STANDARD',
      },
    ],
  },
  {
    id: 'biometric-study-consent',
    title: 'Biometric & Optical Sensor Research Participation Consent',
    subtitle: 'Informed participant consent form detailing camera usage, telemetry, and deletion rights',
    documentType: 'CONSENT_FORM',
    counterpartyOrContext: 'Human-Computer Interaction Lab — Protocol #2026-11',
    sourcePath: 'presets://consent/hci-optical-protocol-2026.md',
    sourceHashSha256: sha256Hex('biometric-study-consent-v2'),
    clauses: [
      {
        id: 'con-1',
        number: 'PART A',
        title: 'Local Optical Processing & Camera Scope',
        category: 'Sensor Scope',
        body: 'This study captures video frames from your front-facing webcam solely to compute on-device physiological signals (pulse waveform, chest breathing motion, and facial landmarks). No raw video or audio recording is ever saved to disk or transmitted over the network.',
        wordCount: 39,
        minRequiredDwellMs: 6500,
        riskTier: 'STANDARD',
      },
      {
        id: 'con-2',
        number: 'PART B',
        title: 'SDK Licensing Handshake & Telemetry Opt-Out',
        category: 'Network Disclosure',
        body: 'While physiological computation occurs locally on your machine, the underlying SDK performs an authenticated TLS license check with Presage Technologies at session start. Session diagnostic telemetry is explicitly disabled (enableTelemetry: false) by default.',
        wordCount: 34,
        minRequiredDwellMs: 6200,
        riskTier: 'ELEVATED',
        plainLanguageWarning:
          'Important distinction: Raw video never leaves your PC, but the SDK still performs an authenticated license check at startup.',
      },
      {
        id: 'con-3',
        number: 'PART C',
        title: 'Non-Medical Scope & Right to Immediate Withdrawal',
        category: 'Participant Rights',
        body: 'All metrics displayed are uncalibrated wellness and interaction estimates and must never be used for medical diagnosis or clinical decision-making. You may stop the camera and permanently delete all in-memory session logs at any second with a single click.',
        wordCount: 39,
        minRequiredDwellMs: 6500,
        riskTier: 'STANDARD',
      },
    ],
  },
];

/**
 * Parses a unified `git diff` string into structured, auditable hunk clauses (`DocumentPreset`).
 */
export function parseGitDiffIntoPreset(
  repoName: string,
  branchName: string,
  rawDiff: string,
  repoPath?: string
): DocumentPreset {
  const sourceHashSha256 = sha256Hex(rawDiff || 'empty-diff');
  const fileChunks = rawDiff
    .split(/^diff --git /m)
    .map((c) => c.trim())
    .filter(Boolean);

  const clauses: DocumentClause[] = [];
  let hunkCounter = 1;

  for (const chunk of fileChunks) {
    const lines = chunk.split('\n');
    const headerLine = lines[0] || '';
    const fileMatch = headerLine.match(/a\/([^\s]+)\s+b\/([^\s]+)/);
    const fileName = fileMatch ? fileMatch[2] : headerLine.slice(0, 60);

    // Split by @@ hunk headers or treat whole file diff as one hunk if compact
    const hunkParts = chunk.split(/^(@@[^@]+@@.*)$/m);
    if (hunkParts.length <= 1) {
      const body = lines.slice(1, 35).join('\n').trim() || chunk.slice(0, 800);
      const wordCount = Math.max(18, countWords(body));
      const { riskTier, plainLanguageWarning } = classifyClauseRisk(fileName, body);
      clauses.push({
        id: `diff-${hunkCounter}`,
        number: `HUNK ${String(hunkCounter).padStart(2, '0')}`,
        title: `${fileName}`,
        category: 'Git Diff',
        body,
        isCodeOrDiff: true,
        wordCount,
        minRequiredDwellMs: computeMinDwellMs(wordCount, riskTier),
        riskTier,
        plainLanguageWarning,
      });
      hunkCounter++;
    } else {
      for (let i = 1; i < hunkParts.length; i += 2) {
        const hunkHeader = hunkParts[i].trim();
        const hunkBody = (hunkParts[i + 1] || '').trim();
        const combinedBody = `${hunkHeader}\n${hunkBody.split('\n').slice(0, 28).join('\n')}`;
        const wordCount = Math.max(18, countWords(combinedBody));
        const { riskTier, plainLanguageWarning } = classifyClauseRisk(fileName, combinedBody);
        clauses.push({
          id: `diff-${hunkCounter}`,
          number: `HUNK ${String(hunkCounter).padStart(2, '0')}`,
          title: `${fileName} (${hunkHeader.split('@@')[1]?.trim() || 'hunk'})`,
          category: 'Git Diff Hunk',
          body: combinedBody,
          isCodeOrDiff: true,
          wordCount,
          minRequiredDwellMs: computeMinDwellMs(wordCount, riskTier),
          riskTier,
          plainLanguageWarning,
        });
        hunkCounter++;
        if (clauses.length >= 12) break;
      }
    }
    if (clauses.length >= 12) break;
  }

  return {
    id: `git-diff-${sourceHashSha256.slice(0, 8)}`,
    title: `Git Working Tree Audit: ${repoName}`,
    subtitle: `Branch: ${branchName} • ${clauses.length} diff hunks parsed from local repository`,
    documentType: 'GIT_DIFF',
    counterpartyOrContext: `Repo: ${repoPath || repoName} (SHA-256: ${sourceHashSha256.slice(0, 12)})`,
    sourcePath: repoPath || repoName,
    sourceHashSha256,
    clauses:
      clauses.length > 0
        ? clauses
        : [
            {
              id: 'diff-1',
              number: 'HUNK 01',
              title: `${repoName} (Clean Working Tree)`,
              category: 'Git Status',
              body: 'No uncommitted tracked modifications found in git diff.',
              isCodeOrDiff: true,
              wordCount: 15,
              minRequiredDwellMs: 2800,
              riskTier: 'STANDARD',
            },
          ],
  };
}

/**
 * Parses arbitrary user-pasted or local-file text/Markdown/SQL/code into structured `DocumentClause` blocks.
 */
export function parseCustomDocumentIntoClauses(
  title: string,
  rawText: string,
  sourcePath?: string
): DocumentPreset {
  const cleanTitle = title.trim() || 'Custom Audited Document';
  const sourceHashSha256 = sha256Hex(rawText);
  const isCodeFile = Boolean(
    sourcePath && /\.(sql|ts|js|py|json|yaml|yml|diff|patch|sh)$/i.test(sourcePath)
  );

  // Split by Markdown headers, SQL statements (`;`), or double newlines
  const rawBlocks = rawText
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length >= 15);

  const effectiveBlocks =
    rawBlocks.length > 0 ? rawBlocks.slice(0, 15) : [rawText.trim() || 'No content provided.'];

  const clauses: DocumentClause[] = effectiveBlocks.map((block, idx) => {
    const lines = block.split('\n');
    let clauseTitle = `Section ${idx + 1}`;
    let body = block;

    if (lines.length > 1 && lines[0].length < 95) {
      clauseTitle = lines[0].replace(/^[#*§\d.\-\s]+/, '').trim() || clauseTitle;
      body = lines.slice(1).join('\n').trim();
    } else {
      const firstSentence = block.split(/[.!?\n]/)[0] || '';
      clauseTitle =
        firstSentence.length > 4 && firstSentence.length <= 70
          ? firstSentence.trim()
          : `Section ${idx + 1}`;
    }

    const wordCount = Math.max(12, countWords(body));
    const { riskTier, plainLanguageWarning } = classifyClauseRisk(clauseTitle, body);
    const minRequiredDwellMs = computeMinDwellMs(wordCount, riskTier);
    const isBlockCodeOrDiff =
      isCodeFile ||
      /^(@@|diff --git|\+[^\+]|\-[^\-])|\b(DROP TABLE|TRUNCATE TABLE|ALTER TABLE|SELECT |BEGIN TRANSACTION|export function)\b/m.test(
        body
      );

    return {
      id: `custom-${idx + 1}`,
      number: isBlockCodeOrDiff ? `HUNK ${String(idx + 1).padStart(2, '0')}` : `§ ${idx + 1}`,
      title: clauseTitle,
      category:
        riskTier === 'CRITICAL_TRAP'
          ? 'Critical Risk'
          : riskTier === 'ELEVATED'
          ? 'Elevated Term'
          : isBlockCodeOrDiff
          ? 'Code / Diff Hunk'
          : 'General Clause',
      body,
      isCodeOrDiff: isBlockCodeOrDiff,
      wordCount,
      minRequiredDwellMs,
      riskTier,
      plainLanguageWarning,
    };
  });

  return {
    id: `doc-${sourceHashSha256.slice(0, 10)}`,
    title: cleanTitle,
    subtitle: sourcePath
      ? `Local File: ${sourcePath} (${clauses.length} sections)`
      : `User-imported document (${clauses.length} clauses parsed)`,
    documentType: sourcePath ? 'LOCAL_FILE' : 'CUSTOM',
    counterpartyOrContext: sourcePath
      ? `File SHA-256: ${sourceHashSha256.slice(0, 16)}…`
      : 'Local Custom Document Audit',
    sourcePath,
    sourceHashSha256,
    clauses,
  };
}
