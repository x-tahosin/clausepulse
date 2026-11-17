/**
 * ClausePulse Core Types (v2.0)
 *
 * Matches the official Presage SmartSpectra SDK protobuf schema (`@smartspectra/node-sdk/messages`)
 * and defines domain types for per-clause physiological attribution, local file/Git diff ingestion,
 * Pass-1 vs. Pass-2 "Ghost Take" comparison, and quantitative evaluation benchmarking.
 */

export type ProtobufTimestamp = number | bigint | { toNumber(): number } | null | undefined;

export interface SmartSpectraMeasurement {
  value: number;
  stable?: boolean;
  timestamp?: ProtobufTimestamp;
}

export interface SmartSpectraMeasurementWithConfidence {
  value: number;
  stable?: boolean;
  confidence?: number;
  timestamp?: ProtobufTimestamp;
}

export interface SmartSpectraDetectionStatus {
  detected: boolean;
  stable?: boolean;
  timestamp?: ProtobufTimestamp;
}

export interface SmartSpectraPoint2d {
  x: number;
  y: number;
}

export interface SmartSpectraLandmarks {
  value?: SmartSpectraPoint2d[];
  stable?: boolean;
  reset?: boolean;
  timestamp?: ProtobufTimestamp;
}

export interface SmartSpectraExpressionScore {
  type: number; // 1=ANGRY, 2=CONTEMPT, 3=DISGUST, 4=FEAR, 5=HAPPY, 6=NEUTRAL, 7=SAD, 8=SURPRISE
  confidence: number; // [0.0, 100.0]
}

export interface SmartSpectraExpression {
  stable?: boolean;
  timestamp?: ProtobufTimestamp;
  scores?: SmartSpectraExpressionScore[];
}

export interface SmartSpectraHrv {
  rmssd?: number;
  meanNn?: number;
  mean_nn?: number;
  sdnn?: number;
  baevsky?: number;
  timestamp?: ProtobufTimestamp;
  confidence?: number;
  stable?: boolean;
}

export interface DecodedSmartSpectraMetrics {
  breathing?: {
    rate?: SmartSpectraMeasurementWithConfidence[];
    upperTrace?: SmartSpectraMeasurement[];
    upper_trace?: SmartSpectraMeasurement[];
    lowerTrace?: SmartSpectraMeasurement[];
    lower_trace?: SmartSpectraMeasurement[];
  };
  cardio?: {
    pulseRate?: SmartSpectraMeasurementWithConfidence[];
    pulse_rate?: SmartSpectraMeasurementWithConfidence[];
    arterialPressureTrace?: SmartSpectraMeasurementWithConfidence[];
    arterial_pressure_trace?: SmartSpectraMeasurementWithConfidence[];
    hrv?: SmartSpectraHrv[];
  };
  face?: {
    blinking?: SmartSpectraDetectionStatus[];
    talking?: SmartSpectraDetectionStatus[];
    landmarks?: SmartSpectraLandmarks[];
    expression?: SmartSpectraExpression[];
  };
  eda?: {
    trace?: SmartSpectraMeasurement[];
  };
}

export type SignalSourceMode =
  | 'LIVE_CAMERA_SMARTSPECTRA'
  | 'LIVE_WEBCAM_OPTICAL'
  | 'VIDEO_FILE_SMARTSPECTRA'
  | 'DETERMINISTIC_REPLAY_BENCH';

export interface PersonalBaseline {
  calibratedAtIso: string;
  durationSec: number;
  pulseMedianBpm: number | null;
  pulseIqrBpm: number;
  breathingMedianBrpm: number | null;
  upperTraceStdDev: number;
  blinkRatePerMin: number;
  expressionTensionMedian: number;
  edaMedian: number | null;
  hrvRmssdMs: number | null;
  hrvBaevskyIndex: number | null;
  sampleCount: number;
  talkingRatio: number;
  valid: boolean;
}

export type ClauseRiskTier = 'STANDARD' | 'ELEVATED' | 'CRITICAL_TRAP';

export type ClauseVerificationStatus =
  | 'UNREAD'
  | 'READING'
  | 'VERIFIED_CALM'
  | 'SKIM_DETECTED'
  | 'APNEA_FRICTION'
  | 'SIGNAL_UNVERIFIED'
  | 'SETTLED_OVERRIDE';

export interface DocumentClause {
  id: string;
  number: string;
  title: string;
  category: string;
  body: string;
  isCodeOrDiff?: boolean;
  wordCount: number;
  minRequiredDwellMs: number;
  riskTier: ClauseRiskTier;
  plainLanguageWarning?: string;
}

export interface DocumentPreset {
  id: string;
  title: string;
  subtitle: string;
  documentType: 'CONTRACT' | 'RUNBOOK' | 'CONSENT_FORM' | 'GIT_DIFF' | 'LOCAL_FILE' | 'CUSTOM';
  counterpartyOrContext: string;
  sourcePath?: string;
  sourceHashSha256?: string;
  clauses: DocumentClause[];
}

export interface ClausePassSnapshot {
  passNumber: number;
  status: ClauseVerificationStatus;
  dwellTimeMs: number;
  gazePresenceRatio: number;
  pulseDeltaBpm: number | null;
  maxApneaHoldSec: number;
  tracePreview: readonly number[];
  recordedAtIso: string;
}

export interface ClauseTelemetryRecord {
  clauseId: string;
  status: ClauseVerificationStatus;
  statusReason: string;
  dwellTimeMs: number;
  gazeOnScreenMs: number;
  gazePresenceRatio: number;
  pulseMeanBpm: number | null;
  pulseDeltaBpm: number | null;
  pulseConfidence: number;
  breathingMeanBrpm: number | null;
  breathingConfidence: number;
  maxApneaHoldSec: number;
  upperTraceVariance: number;
  blinkCount: number;
  blinkRatePerMin: number;
  expressionTensionScore: number;
  edaDelta: number | null;
  talkingDetectedMs: number;
  signalValidRatio: number;
  settledCyclesCompleted: number;
  visitCount: number;
  passHistory: readonly ClausePassSnapshot[];
  latestTracePreview: readonly number[];
  lastUpdatedAtIso: string;
}

export interface LiveSignalSnapshot {
  timestampUs: number;
  processingStatusLabel: string;
  validationCodeLabel: string;
  validationHint: string;
  isValidationOk: boolean;
  pulseBpm: number | null;
  pulseConfidence: number;
  pulseStable: boolean;
  breathingBrpm: number | null;
  breathingConfidence: number;
  breathingStable: boolean;
  latestUpperTrace: number | null;
  latestLowerTrace: number | null;
  latestArterialPressure: number | null;
  latestEda: number | null;
  hrvRmssd: number | null;
  hrvSdnn: number | null;
  hrvBaevsky: number | null;
  hrvConfidence: number;
  isBlinking: boolean;
  isTalking: boolean;
  faceCentered: boolean;
  landmarkCount: number;
  expressionTension: number;
  currentApneaHoldSec: number;
}
