/**
 * ClauseAttributionEngine (v2.0)
 *
 * Pure, immutable state machine that attributes multi-rate SmartSpectra physiological
 * signals onto individual document clauses or Git diff hunks, enforces Model Card
 * talking/confidence gates, detects skimming vs. reading apnea/strain, records
 * Pass-1 vs. Pass-2 "Ghost Take" histories, and manages the SignSteady Respiratory Gate.
 */

import {
  computeApneaHoldSeconds,
  computeExpressionTension,
  computeMedian,
  countCoherentBreathCycles,
  evaluateFaceFraming,
} from './signalMath';
import {
  ClausePassSnapshot,
  ClauseTelemetryRecord,
  ClauseVerificationStatus,
  DecodedSmartSpectraMetrics,
  DocumentClause,
  PersonalBaseline,
  SmartSpectraMeasurement,
} from './types';

export interface ActiveClauseBuffer {
  clauseId: string;
  enteredAtMs: number;
  lastTickAtMs: number;
  priorDwellMs: number;
  priorGazeMs: number;
  priorTalkingMs: number;
  priorBlinkCount: number;
  accumulatedDwellMs: number;
  accumulatedGazeMs: number;
  accumulatedTalkingMs: number;
  validPackets: number;
  totalPackets: number;
  pulseSamples: readonly number[];
  pulseConfidences: readonly number[];
  breathingSamples: readonly number[];
  breathingConfidences: readonly number[];
  upperTraceSamples: readonly SmartSpectraMeasurement[];
  expressionScores: readonly number[];
  edaSamples: readonly number[];
  blinkCount: number;
  wasBlinkingLastPacket: boolean;
  maxApneaHoldSec: number;
}

export interface DocumentSessionState {
  clauses: readonly DocumentClause[];
  activeClauseId: string;
  records: Readonly<Record<string, ClauseTelemetryRecord>>;
  activeBuffer: ActiveClauseBuffer;
  settlingTargetClauseId: string | null;
  settlingTraceBuffer: readonly SmartSpectraMeasurement[];
}

export function createInitialClauseRecord(clause: DocumentClause): ClauseTelemetryRecord {
  return {
    clauseId: clause.id,
    status: 'UNREAD',
    statusReason: 'Not yet reviewed in this session.',
    dwellTimeMs: 0,
    gazeOnScreenMs: 0,
    gazePresenceRatio: 0,
    pulseMeanBpm: null,
    pulseDeltaBpm: null,
    pulseConfidence: 0,
    breathingMeanBrpm: null,
    breathingConfidence: 0,
    maxApneaHoldSec: 0,
    upperTraceVariance: 0,
    blinkCount: 0,
    blinkRatePerMin: 0,
    expressionTensionScore: 0,
    edaDelta: null,
    talkingDetectedMs: 0,
    signalValidRatio: 0,
    settledCyclesCompleted: 0,
    visitCount: 0,
    passHistory: [],
    latestTracePreview: [],
    lastUpdatedAtIso: new Date(0).toISOString(),
  };
}

export function createActiveClauseBuffer(
  clauseId: string,
  nowMs = Date.now(),
  priorRecord?: ClauseTelemetryRecord
): ActiveClauseBuffer {
  return {
    clauseId,
    enteredAtMs: nowMs,
    lastTickAtMs: nowMs,
    priorDwellMs: priorRecord?.dwellTimeMs ?? 0,
    priorGazeMs: priorRecord?.gazeOnScreenMs ?? 0,
    priorTalkingMs: priorRecord?.talkingDetectedMs ?? 0,
    priorBlinkCount: priorRecord?.blinkCount ?? 0,
    accumulatedDwellMs: 0,
    accumulatedGazeMs: 0,
    accumulatedTalkingMs: 0,
    validPackets: 0,
    totalPackets: 0,
    pulseSamples: [],
    pulseConfidences: [],
    breathingSamples: [],
    breathingConfidences: [],
    upperTraceSamples: [],
    expressionScores: [],
    edaSamples: [],
    blinkCount: 0,
    wasBlinkingLastPacket: false,
    maxApneaHoldSec: 0,
  };
}

export function createDocumentSession(
  clauses: readonly DocumentClause[],
  nowMs = Date.now()
): DocumentSessionState {
  const firstId = clauses[0]?.id ?? '';
  const records: Record<string, ClauseTelemetryRecord> = {};
  for (const c of clauses) {
    records[c.id] = {
      ...createInitialClauseRecord(c),
      status: c.id === firstId ? 'READING' : 'UNREAD',
      statusReason: c.id === firstId ? 'Currently in reading focus.' : 'Awaiting reading focus.',
      visitCount: c.id === firstId ? 1 : 0,
      lastUpdatedAtIso: new Date(nowMs).toISOString(),
    };
  }

  return {
    clauses,
    activeClauseId: firstId,
    records,
    activeBuffer: createActiveClauseBuffer(firstId, nowMs),
    settlingTargetClauseId: null,
    settlingTraceBuffer: [],
  };
}

function downsampleTracePreview(samples: readonly SmartSpectraMeasurement[], maxPoints = 48): number[] {
  if (!samples || samples.length === 0) return [];
  const raw = samples.map((s) => Number(s.value.toFixed(3)));
  if (raw.length <= maxPoints) return raw;
  const step = raw.length / maxPoints;
  const out: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(raw[Math.min(raw.length - 1, Math.floor(i * step))]);
  }
  return out;
}

/**
 * Evaluates a clause's accumulated biometric buffer against the user's personal baseline
 * and SmartSpectra Model Card rules to produce an objective verification status.
 */
export function evaluateClauseBuffer(
  clause: DocumentClause,
  buffer: ActiveClauseBuffer,
  previousRecord: ClauseTelemetryRecord,
  baseline: PersonalBaseline | null,
  nowMs = Date.now(),
  recordPassSnapshot = false
): ClauseTelemetryRecord {
  const totalDwellMs = buffer.priorDwellMs + buffer.accumulatedDwellMs;
  const totalGazeMs = buffer.priorGazeMs + buffer.accumulatedGazeMs;
  const totalTalkingMs = buffer.priorTalkingMs + buffer.accumulatedTalkingMs;
  const gazePresenceRatio =
    totalDwellMs > 0 ? Number(Math.min(1, totalGazeMs / totalDwellMs).toFixed(2)) : 0;

  const pulseMean = computeMedian(buffer.pulseSamples) ?? previousRecord.pulseMeanBpm;
  const pulseConf = computeMedian(buffer.pulseConfidences) ?? previousRecord.pulseConfidence;
  const pulseDelta =
    pulseMean !== null && baseline?.pulseMedianBpm != null
      ? Number((pulseMean - baseline.pulseMedianBpm).toFixed(1))
      : null;

  const breathMean = computeMedian(buffer.breathingSamples) ?? previousRecord.breathingMeanBrpm;
  const breathConf = computeMedian(buffer.breathingConfidences) ?? previousRecord.breathingConfidence;

  const apnea = computeApneaHoldSeconds(
    buffer.upperTraceSamples,
    baseline?.upperTraceStdDev ?? 0.35,
    false
  );
  // If the user is re-reading calmly on a subsequent visit and has accumulated >= 25 samples,
  // evaluate the current visit's apnea rather than permanently locking to an old apnea hold,
  // while keeping historical pass records in `passHistory`.
  const currentVisitApnea = Math.max(buffer.maxApneaHoldSec, apnea.maxHoldSec);
  const maxApneaHoldSec = Number(
    (buffer.upperTraceSamples.length >= 25 && currentVisitApnea < 3.0
      ? currentVisitApnea
      : Math.max(previousRecord.maxApneaHoldSec, currentVisitApnea)
    ).toFixed(1)
  );

  const totalBlinks = buffer.priorBlinkCount + buffer.blinkCount;
  const dwellMin = Math.max(0.05, totalDwellMs / 60_000);
  const blinkRatePerMin = Number((totalBlinks / dwellMin).toFixed(1));

  const exprScore = computeMedian(buffer.expressionScores) ?? previousRecord.expressionTensionScore;
  const edaMedian = computeMedian(buffer.edaSamples);
  const edaDelta =
    edaMedian !== null && baseline?.edaMedian != null
      ? Number((edaMedian - baseline.edaMedian).toFixed(3))
      : previousRecord.edaDelta;

  const signalValidRatio =
    buffer.totalPackets > 0
      ? Number((buffer.validPackets / buffer.totalPackets).toFixed(2))
      : previousRecord.signalValidRatio;

  const tracePreview =
    buffer.upperTraceSamples.length > 0
      ? downsampleTracePreview(buffer.upperTraceSamples)
      : previousRecord.latestTracePreview;

  // Preserve SETTLED_OVERRIDE if already unlocked via respiratory gate
  if (previousRecord.status === 'SETTLED_OVERRIDE') {
    return {
      ...previousRecord,
      dwellTimeMs: totalDwellMs,
      gazeOnScreenMs: totalGazeMs,
      gazePresenceRatio,
      latestTracePreview: tracePreview,
      lastUpdatedAtIso: new Date(nowMs).toISOString(),
    };
  }

  let status: ClauseVerificationStatus = 'VERIFIED_CALM';
  let statusReason = 'Verified: adequate reading dwell, centered gaze, and steady respiratory rhythm.';

  // Check current buffer talking ratio so a silent re-read clears an earlier talking pause
  const currentBufferTalkingRatio =
    buffer.accumulatedDwellMs > 0
      ? buffer.accumulatedTalkingMs / buffer.accumulatedDwellMs
      : totalDwellMs > 0
      ? totalTalkingMs / totalDwellMs
      : 0;

  // Rule 1: Skim Detection (dwell time below physical reading floor OR eyes off-screen)
  if (totalDwellMs < clause.minRequiredDwellMs || gazePresenceRatio < 0.55) {
    status = 'SKIM_DETECTED';
    const pct = Math.min(100, Math.round((totalDwellMs / clause.minRequiredDwellMs) * 100));
    statusReason =
      gazePresenceRatio < 0.55 && totalDwellMs >= 1500
        ? `Gaze off-screen for ${Math.round((1 - gazePresenceRatio) * 100)}% of dwell window. Re-read with eyes on clause.`
        : `Skimmed (${(totalDwellMs / 1000).toFixed(1)}s vs ${(clause.minRequiredDwellMs / 1000).toFixed(1)}s minimum for ${clause.wordCount} words — ${pct}% completed).`;
  }
  // Rule 2: Model Card Talking / Low-Confidence Gate (never fabricate physiological verdicts during speech/motion)
  else if (currentBufferTalkingRatio > 0.35 || (buffer.totalPackets >= 5 && signalValidRatio < 0.4)) {
    status = 'SIGNAL_UNVERIFIED';
    statusReason =
      currentBufferTalkingRatio > 0.35
        ? 'Vocalization detected (face.talking = true). SmartSpectra breathing rate is paused during speech per Model Card.'
        : 'Camera framing or lighting unstable during reading window. Hold still with face and upper chest illuminated.';
  }
  // Rule 3: Reading Apnea / High Autonomic Strain Detection
  else {
    const hasApnea = maxApneaHoldSec >= 4.5;
    const hasPulseSpike = pulseDelta !== null && pulseConf >= 40 && pulseDelta >= 7.5;
    const exprDelta = exprScore - (baseline?.expressionTensionMedian ?? 8.0);
    const hasOcularStrain = exprDelta >= 22 && blinkRatePerMin < 7.0;

    if (hasApnea || hasPulseSpike || hasOcularStrain) {
      status = 'APNEA_FRICTION';
      const reasons: string[] = [];
      if (hasApnea) reasons.push(`${maxApneaHoldSec}s breath-hold (reading apnea)`);
      if (hasPulseSpike) reasons.push(`+${pulseDelta} BPM pulse surge above baseline`);
      if (hasOcularStrain) reasons.push(`elevated brow tension (+${exprDelta.toFixed(0)}%) with blink suppression`);
      statusReason = `Physiological friction detected: ${reasons.join(' + ')}. Complete 2 settling breaths to attest.`;
    }
  }

  let nextPassHistory = previousRecord.passHistory;
  if (recordPassSnapshot && buffer.accumulatedDwellMs >= 400) {
    const snapshot: ClausePassSnapshot = {
      passNumber: previousRecord.passHistory.length + 1,
      status,
      dwellTimeMs: totalDwellMs,
      gazePresenceRatio,
      pulseDeltaBpm: pulseDelta,
      maxApneaHoldSec,
      tracePreview,
      recordedAtIso: new Date(nowMs).toISOString(),
    };
    nextPassHistory = [...previousRecord.passHistory, snapshot].slice(-6);
  }

  return {
    clauseId: clause.id,
    status,
    statusReason,
    dwellTimeMs: totalDwellMs,
    gazeOnScreenMs: totalGazeMs,
    gazePresenceRatio,
    pulseMeanBpm: pulseMean !== null ? Number(pulseMean.toFixed(1)) : null,
    pulseDeltaBpm: pulseDelta,
    pulseConfidence: Number(pulseConf.toFixed(0)),
    breathingMeanBrpm: breathMean !== null ? Number(breathMean.toFixed(1)) : null,
    breathingConfidence: Number(breathConf.toFixed(0)),
    maxApneaHoldSec,
    upperTraceVariance: apnea.traceStdDev,
    blinkCount: totalBlinks,
    blinkRatePerMin,
    expressionTensionScore: Number(exprScore.toFixed(1)),
    edaDelta,
    talkingDetectedMs: totalTalkingMs,
    signalValidRatio,
    settledCyclesCompleted: previousRecord.settledCyclesCompleted,
    visitCount: previousRecord.visitCount,
    passHistory: nextPassHistory,
    latestTracePreview: tracePreview,
    lastUpdatedAtIso: new Date(nowMs).toISOString(),
  };
}

/**
 * Ingests a live SmartSpectra metrics slice into the currently active clause buffer
 * (and into the Respiratory Settling Gate if active).
 */
export function ingestMetricsForActiveClause(
  session: DocumentSessionState,
  metrics: DecodedSmartSpectraMetrics,
  isValidationOk: boolean,
  baseline: PersonalBaseline | null,
  nowMs = Date.now(),
  explicitStepMs?: number
): DocumentSessionState {
  const dtMs =
    explicitStepMs !== undefined
      ? Math.max(16, Math.min(2000, explicitStepMs))
      : Math.min(1000, Math.max(16, nowMs - session.activeBuffer.lastTickAtMs));

  const talkingArr = metrics.face?.talking ?? [];
  const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);

  const landmarksArr = metrics.face?.landmarks ?? [];
  const latestLandmarks = landmarksArr.length > 0 ? landmarksArr[landmarksArr.length - 1] : undefined;
  const framing = evaluateFaceFraming(latestLandmarks);
  // Strict gaze verification: requires valid camera status AND actual centered face landmarks
  const gazeOnScreen = isValidationOk && landmarksArr.length > 0 && framing.faceCentered;

  const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
  const validPulses = pulseArr.filter(
    (p) => p.value >= 40 && p.value <= 150 && (p.confidence === undefined || p.confidence >= 40)
  );

  const breathArr = metrics.breathing?.rate ?? [];
  const validBreaths = !isTalking
    ? breathArr.filter(
        (b) => b.value >= 5 && b.value <= 40 && (b.confidence === undefined || b.confidence >= 45)
      )
    : [];

  const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
  const combinedUpper = [...session.activeBuffer.upperTraceSamples, ...upperArr].slice(-450);

  const apneaNow = computeApneaHoldSeconds(
    combinedUpper,
    baseline?.upperTraceStdDev ?? 0.35,
    isTalking
  );

  const exprArr = metrics.face?.expression ?? [];
  const newExpr =
    exprArr.length > 0 ? [computeExpressionTension(exprArr[exprArr.length - 1])] : [];

  const edaArr = metrics.eda?.trace ?? [];
  const newEda = edaArr.filter((e) => Number.isFinite(e.value)).map((e) => e.value);

  const blinkArr = metrics.face?.blinking ?? [];
  const isBlinkingNow = blinkArr.length > 0 && Boolean(blinkArr[blinkArr.length - 1]?.detected);
  const blinkIncrement = isBlinkingNow && !session.activeBuffer.wasBlinkingLastPacket ? 1 : 0;

  const updatedBuffer: ActiveClauseBuffer = {
    ...session.activeBuffer,
    lastTickAtMs: nowMs,
    accumulatedDwellMs: session.activeBuffer.accumulatedDwellMs + dtMs,
    accumulatedGazeMs: session.activeBuffer.accumulatedGazeMs + (gazeOnScreen ? dtMs : 0),
    accumulatedTalkingMs: session.activeBuffer.accumulatedTalkingMs + (isTalking ? dtMs : 0),
    validPackets: session.activeBuffer.validPackets + (isValidationOk && !isTalking ? 1 : 0),
    totalPackets: session.activeBuffer.totalPackets + 1,
    pulseSamples: [...session.activeBuffer.pulseSamples, ...validPulses.map((p) => p.value)],
    pulseConfidences: [
      ...session.activeBuffer.pulseConfidences,
      ...validPulses.map((p) => p.confidence ?? 80),
    ],
    breathingSamples: [
      ...session.activeBuffer.breathingSamples,
      ...validBreaths.map((b) => b.value),
    ],
    breathingConfidences: [
      ...session.activeBuffer.breathingConfidences,
      ...validBreaths.map((b) => b.confidence ?? 80),
    ],
    upperTraceSamples: combinedUpper,
    expressionScores: [...session.activeBuffer.expressionScores, ...newExpr],
    edaSamples: [...session.activeBuffer.edaSamples, ...newEda],
    blinkCount: session.activeBuffer.blinkCount + blinkIncrement,
    wasBlinkingLastPacket: isBlinkingNow,
    maxApneaHoldSec: Math.max(session.activeBuffer.maxApneaHoldSec, apneaNow.maxHoldSec),
  };

  // Update live preview record for the active clause
  const activeClause = session.clauses.find((c) => c.id === session.activeClauseId);
  const prevRecord = session.records[session.activeClauseId];
  let updatedRecords = session.records;

  if (activeClause && prevRecord) {
    // If this clause is currently inside the SignSteady Respiratory Settling Gate,
    // keep its APNEA_FRICTION status & telemetry locked until 2 coherent breath cycles complete.
    if (session.settlingTargetClauseId === session.activeClauseId) {
      updatedRecords = {
        ...session.records,
        [session.activeClauseId]: {
          ...prevRecord,
          lastUpdatedAtIso: new Date(nowMs).toISOString(),
        },
      };
    } else {
      const evaluated = evaluateClauseBuffer(
        activeClause,
        updatedBuffer,
        prevRecord,
        baseline,
        nowMs,
        false
      );
      updatedRecords = {
        ...session.records,
        [session.activeClauseId]: {
          ...evaluated,
          status:
            prevRecord.status === 'SETTLED_OVERRIDE'
              ? 'SETTLED_OVERRIDE'
              : evaluated.status === 'APNEA_FRICTION'
              ? 'APNEA_FRICTION'
              : evaluated.dwellTimeMs >= activeClause.minRequiredDwellMs &&
                evaluated.status === 'VERIFIED_CALM'
              ? 'VERIFIED_CALM'
              : 'READING',
        },
      };
    }
  }

  // If the Respiratory Settling Gate is active for a high-friction clause, count coherent breath cycles
  let updatedSettlingTarget = session.settlingTargetClauseId;
  let updatedSettlingTrace = session.settlingTraceBuffer;

  if (session.settlingTargetClauseId && !isTalking && upperArr.length > 0) {
    updatedSettlingTrace = [...session.settlingTraceBuffer, ...upperArr].slice(-600);
    const cycles = countCoherentBreathCycles(updatedSettlingTrace, 0.12);
    const targetRec = updatedRecords[session.settlingTargetClauseId];
    if (targetRec) {
      const unlocked = cycles >= 2;
      const settledTracePreview = downsampleTracePreview(updatedSettlingTrace);
      const settledSnapshot: ClausePassSnapshot = {
        passNumber: targetRec.passHistory.length + 1,
        status: 'SETTLED_OVERRIDE',
        dwellTimeMs: targetRec.dwellTimeMs,
        gazePresenceRatio: targetRec.gazePresenceRatio,
        pulseDeltaBpm: targetRec.pulseDeltaBpm,
        maxApneaHoldSec: 0,
        tracePreview: settledTracePreview,
        recordedAtIso: new Date(nowMs).toISOString(),
      };
      const nextPasses: readonly ClausePassSnapshot[] = unlocked
        ? [...targetRec.passHistory, settledSnapshot].slice(-6)
        : targetRec.passHistory;

      updatedRecords = {
        ...updatedRecords,
        [session.settlingTargetClauseId]: {
          ...targetRec,
          settledCyclesCompleted: cycles,
          status: unlocked ? 'SETTLED_OVERRIDE' : targetRec.status,
          statusReason: unlocked
            ? 'Unlocked via SignSteady Gate: 2 coherent respiratory settling cycles verified.'
            : targetRec.statusReason,
          passHistory: nextPasses,
          latestTracePreview: settledTracePreview.length > 0 ? settledTracePreview : targetRec.latestTracePreview,
          lastUpdatedAtIso: new Date(nowMs).toISOString(),
        },
      };
      if (unlocked) {
        updatedSettlingTarget = null;
        updatedSettlingTrace = [];
      }
    }
  }

  return {
    ...session,
    records: updatedRecords,
    activeBuffer: updatedBuffer,
    settlingTargetClauseId: updatedSettlingTarget,
    settlingTraceBuffer: updatedSettlingTrace,
  };
}

/**
 * Transitions focus from the current clause to `nextClauseId`, finalizing the outgoing
 * clause's verification verdict (`VERIFIED_CALM`, `SKIM_DETECTED`, `APNEA_FRICTION`, or `SIGNAL_UNVERIFIED`)
 * and recording a Pass Snapshot for Take Comparison.
 */
export function selectActiveClause(
  session: DocumentSessionState,
  nextClauseId: string,
  baseline: PersonalBaseline | null,
  nowMs = Date.now()
): DocumentSessionState {
  if (nextClauseId === session.activeClauseId) return session;

  const outgoingClause = session.clauses.find((c) => c.id === session.activeClauseId);
  const outgoingPrev = session.records[session.activeClauseId];
  const nextRecords: Record<string, ClauseTelemetryRecord> = { ...session.records };

  if (outgoingClause && outgoingPrev) {
    nextRecords[outgoingClause.id] = evaluateClauseBuffer(
      outgoingClause,
      session.activeBuffer,
      outgoingPrev,
      baseline,
      nowMs,
      true
    );
  }

  const incomingPrev = nextRecords[nextClauseId];
  if (incomingPrev) {
    nextRecords[nextClauseId] = {
      ...incomingPrev,
      status:
        incomingPrev.status === 'VERIFIED_CALM' || incomingPrev.status === 'SETTLED_OVERRIDE'
          ? incomingPrev.status
          : 'READING',
      visitCount: incomingPrev.visitCount + 1,
      lastUpdatedAtIso: new Date(nowMs).toISOString(),
    };
  }

  return {
    ...session,
    activeClauseId: nextClauseId,
    records: nextRecords,
    activeBuffer: createActiveClauseBuffer(nextClauseId, nowMs, nextRecords[nextClauseId]),
  };
}

/**
 * Finalizes the currently active clause without switching away (e.g., when clicking "Verify Current Clause").
 */
export function finalizeCurrentClause(
  session: DocumentSessionState,
  baseline: PersonalBaseline | null,
  nowMs = Date.now()
): DocumentSessionState {
  const activeClause = session.clauses.find((c) => c.id === session.activeClauseId);
  const prev = session.records[session.activeClauseId];
  if (!activeClause || !prev) return session;

  const finalized = evaluateClauseBuffer(
    activeClause,
    session.activeBuffer,
    prev,
    baseline,
    nowMs,
    true
  );
  return {
    ...session,
    records: {
      ...session.records,
      [activeClause.id]: finalized,
    },
    activeBuffer: createActiveClauseBuffer(activeClause.id, nowMs, finalized),
  };
}

/**
 * Starts the SignSteady Respiratory Settling Gate for a clause flagged with `APNEA_FRICTION`.
 */
export function startSettlingGate(
  session: DocumentSessionState,
  clauseId: string
): DocumentSessionState {
  return {
    ...session,
    settlingTargetClauseId: clauseId,
    settlingTraceBuffer: [],
  };
}

/**
 * Computes overall document sign-off readiness.
 * Sign-off is blocked if any clause is UNREAD, SKIM_DETECTED, or unresolved APNEA_FRICTION.
 */
export function computeDocumentSignOffSummary(session: DocumentSessionState): {
  canSignOff: boolean;
  totalClauses: number;
  verifiedCount: number;
  skimmedCount: number;
  frictionCount: number;
  unverifiedSignalCount: number;
  unreadCount: number;
  blockingClauseIds: readonly string[];
} {
  let verifiedCount = 0;
  let skimmedCount = 0;
  let frictionCount = 0;
  let unverifiedSignalCount = 0;
  let unreadCount = 0;
  const blockingClauseIds: string[] = [];

  for (const c of session.clauses) {
    const r = session.records[c.id];
    const st = r?.status ?? 'UNREAD';
    if (st === 'VERIFIED_CALM' || st === 'SETTLED_OVERRIDE') {
      verifiedCount++;
    } else if (st === 'SKIM_DETECTED') {
      skimmedCount++;
      blockingClauseIds.push(c.id);
    } else if (st === 'APNEA_FRICTION') {
      frictionCount++;
      blockingClauseIds.push(c.id);
    } else if (st === 'SIGNAL_UNVERIFIED') {
      unverifiedSignalCount++;
      if (c.riskTier === 'CRITICAL_TRAP') {
        blockingClauseIds.push(c.id);
      }
    } else {
      unreadCount++;
      blockingClauseIds.push(c.id);
    }
  }

  return {
    canSignOff: blockingClauseIds.length === 0 && session.clauses.length > 0,
    totalClauses: session.clauses.length,
    verifiedCount,
    skimmedCount,
    frictionCount,
    unverifiedSignalCount,
    unreadCount,
    blockingClauseIds,
  };
}
