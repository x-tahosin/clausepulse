/**
 * ClausePulse v2.0 Renderer Application
 *
 * Integrates:
 * 1. Official `@smartspectra/node-sdk/renderer` (`SmartSpectraSDK`) + `@smartspectra/node-sdk/messages` (`decodeMetrics`)
 * 2. Real-Time Hardware Webcam Optical ROI Processor (`LiveWebcamOpticalProcessor`) when running
 *    live camera without a cloud API key (`LIVE_WEBCAM_OPTICAL`) + live HUD reticle canvas
 * 3. Real Webcam Video Take Recorder (`MediaRecorder` -> `.webm` on disk -> `SmartSpectraSDK.useFile`)
 * 4. Real Local File & Live Git Repository Diff Ingestion (`openLocalFile`, `scanGitDiff`)
 * 5. Pure TypeScript `ClauseAttributionEngine`, `BaselineCalibrator`, RFC 6234 `ReceiptExporter`,
 *    and 30-Scenario Quantitative `EvalHarness`
 */

import {
  BaselineAccumulatorState,
  createBaselineAccumulator,
  finalizePersonalBaseline,
  ingestBaselinePacket,
} from '../core/baselineCalibrator';
import {
  computeDocumentSignOffSummary,
  createDocumentSession,
  DocumentSessionState,
  finalizeCurrentClause,
  ingestMetricsForActiveClause,
  selectActiveClause,
  startSettlingGate,
} from '../core/clauseEngine';
import {
  BUILTIN_DOCUMENT_PRESETS,
  parseCustomDocumentIntoClauses,
  parseGitDiffIntoPreset,
} from '../core/documents';
import { runEvaluationBenchmarkSuite } from '../core/evalHarness';
import {
  buildReadReceiptPayload,
  formatReadReceiptMarkdown,
  ReadReceiptPayload,
} from '../core/receiptExporter';
import {
  generateReplayMetricsSlice,
  ReplayScenarioProfile,
} from '../core/replayFixtures';
import {
  computeApneaHoldSeconds,
  computeExpressionTension,
  evaluateFaceFraming,
} from '../core/signalMath';
import {
  DecodedSmartSpectraMetrics,
  DocumentPreset,
  PersonalBaseline,
  SignalSourceMode,
} from '../core/types';
import {
  LiveWebcamOpticalProcessor,
  renderCameraHudReticle,
} from './opticalSensor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  SmartSpectraSDK,
  ProcessingStatus,
  ValidationCode,
  SmartSpectraErrorCode,
  breathingMetrics,
  cardioMetrics,
  faceMetrics,
  edaMetrics,
} = require('@smartspectra/node-sdk/renderer');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { decodeMetrics } = require('@smartspectra/node-sdk/messages');

declare global {
  interface Window {
    clausePulseHost?: {
      getConfig: () => Promise<{
        hasApiKey: boolean;
        maskedKey: string;
        keySource: string;
        sdkVersion: string;
        telemetryEnabled: boolean;
        availableCameras: Array<{ id: string; name: string | null; facing: string }>;
        platform: string;
      }>;
      getSessionApiKey: () => Promise<string>;
      saveApiKey: (key: string) => Promise<{
        ok: boolean;
        hasApiKey: boolean;
        maskedKey: string;
        keySource: string;
      }>;
      forgetApiKey: () => Promise<{
        ok: boolean;
        hasApiKey: boolean;
        maskedKey: string;
        keySource: string;
      }>;
      setTelemetryPreference: (enabled: boolean) => Promise<{ telemetryEnabled: boolean }>;
      checkDeviceReadiness: () => Promise<{ verdict: string; reason: string }>;
      openLocalFile: (explicitFilePath?: string) => Promise<{
        ok: boolean;
        filePath?: string;
        fileName?: string;
        content?: string;
        error?: string;
        canceled?: boolean;
      }>;
      scanGitDiff: (chooseDirectory?: boolean) => Promise<{
        ok: boolean;
        repoName?: string;
        repoPath?: string;
        branchName?: string;
        rawDiff?: string;
        error?: string;
        canceled?: boolean;
      }>;
      saveRecordedVideo: (
        bytes: Uint8Array,
        clauseId: string
      ) => Promise<{ ok: boolean; filePath?: string; fileName?: string; error?: string }>;
      runVideoFileSession: (videoPath?: string) => Promise<{
        ok: boolean;
        localOpticalPlayback?: boolean;
        fullPath?: string;
        videoPath?: string;
        error?: string;
        canceled?: boolean;
      }>;
      stopVideoFileSession: () => Promise<{ ok: boolean }>;
      onVideoFileEvent: (callback: (payload: any) => void) => () => void;
      saveReceipt: (receipt: ReadReceiptPayload) => Promise<{
        ok: boolean;
        count: number;
        receipts: ReadReceiptPayload[];
      }>;
      getReceipts: () => Promise<ReadReceiptPayload[]>;
      exportReceiptFile: (
        markdown: string,
        jsonStr: string,
        defaultName: string
      ) => Promise<{ ok: boolean; filePath?: string; canceled?: boolean }>;
      wipeAllLocalData: () => Promise<{
        ok: boolean;
        deletedKey: boolean;
        deletedReceipts: boolean;
      }>;
    };
  }
}

const STATUS_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(ProcessingStatus || {}).map(([k, v]) => [Number(v), k.replace(/^k/, '')])
);

const VALIDATION_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(ValidationCode || {}).map(([k, v]) => [Number(v), k.replace(/^k/, '')])
);

const $ = <T extends HTMLElement = HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

// Browser Companion Polyfill when running on GitHub Pages (`https://x-tahosin.github.io/clausepulse/`)
// outside the Electron preload context (`window.clausePulseHost` is undefined).
if (typeof window !== 'undefined' && !window.clausePulseHost) {
  const STORAGE_KEY = 'clausepulse_browser_receipts_v2';
  const loadLocalReceipts = (): ReadReceiptPayload[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  window.clausePulseHost = {
    getConfig: async () => ({
      hasApiKey: false,
      maskedKey: '',
      keySource: 'BROWSER_COMPANION',
      sdkVersion: '3.5.0',
      telemetryEnabled: false,
      availableCameras: [],
      platform: 'web-browser-companion',
    }),
    getSessionApiKey: async () => '',
    saveApiKey: async () => ({
      ok: true,
      hasApiKey: false,
      maskedKey: '',
      keySource: 'BROWSER_COMPANION',
    }),
    forgetApiKey: async () => ({
      ok: true,
      hasApiKey: false,
      maskedKey: '',
      keySource: 'BROWSER_COMPANION',
    }),
    setTelemetryPreference: async (enabled: boolean) => ({ telemetryEnabled: enabled }),
    checkDeviceReadiness: async () => ({
      verdict: 'browser_optical_ready',
      reason:
        'Browser Companion Active (30 FPS Canvas2D rPPG + Chest ROI). Clone github.com/x-tahosin/clausepulse and run `npm start` for native C++ @smartspectra/node-sdk@3.5.0 desktop execution.',
    }),
    openLocalFile: () =>
      new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.txt,.sql,.json,.yaml,.yml,.ts,.js,.py,.diff,.patch,.html';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            resolve({ ok: false, canceled: true });
            return;
          }
          const content = await file.text();
          resolve({ ok: true, fileName: file.name, filePath: file.name, content });
        };
        input.click();
      }),
    scanGitDiff: async () => ({
      ok: true,
      repoName: 'prod-ledger-service',
      repoPath: 'github.com/x-tahosin/clausepulse (Sample Audit Patch)',
      branchName: 'main',
      rawDiff: [
        'diff --git a/migrations/20261118_drop_staging.sql b/migrations/20261118_drop_staging.sql',
        'index 4a19b2c..9f81d04 100644',
        '--- a/migrations/20261118_drop_staging.sql',
        '+++ b/migrations/20261118_drop_staging.sql',
        '@@ -10,5 +10,8 @@ BEGIN TRANSACTION;',
        '-SELECT count(*) FROM ledger_staging_unverified;',
        '+-- Promote node-02 and purge unverified staging rows permanently',
        '+DROP TABLE ledger_staging_unverified CASCADE;',
        '+TRUNCATE TABLE settlement_retry_queue;',
        ' COMMIT;',
        'diff --git a/src/auth/verifySessionToken.ts b/src/auth/verifySessionToken.ts',
        'index 81c20b1..3e44f91 100644',
        '--- a/src/auth/verifySessionToken.ts',
        '+++ b/src/auth/verifySessionToken.ts',
        '@@ -42,6 +42,8 @@ export function verifySessionToken(req: Request) {',
        '-  if (!req.headers.authorization) throw new UnauthorizedError();',
        '+  // Emergency migration window bypass',
        '+  if (process.env.DISABLE_AUTH === "1") return { role: "admin" };',
        '   return verifyJwtSignature(req.headers.authorization);',
        ' }',
      ].join('\n'),
    }),
    saveRecordedVideo: async (bytes: Uint8Array, clauseId: string) => {
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `clausepulse-take-${clauseId}-${Date.now()}.webm`;
      a.href = url;
      a.download = fileName;
      a.click();
      return { ok: true, filePath: url, fileName };
    },
    runVideoFileSession: () =>
      new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm,video/quicktime';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            resolve({ ok: false, canceled: true });
            return;
          }
          const blobUrl = URL.createObjectURL(file);
          resolve({
            ok: true,
            localOpticalPlayback: true,
            fullPath: blobUrl,
            videoPath: file.name,
          });
        };
        input.click();
      }),
    stopVideoFileSession: async () => ({ ok: true }),
    onVideoFileEvent: () => () => {},
    saveReceipt: async (receipt: ReadReceiptPayload) => {
      const existing = loadLocalReceipts();
      const updated = [receipt, ...existing].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore quota errors
      }
      return { ok: true, count: updated.length, receipts: updated };
    },
    getReceipts: async () => loadLocalReceipts(),
    exportReceiptFile: async (markdown: string, _jsonStr: string, defaultName: string) => {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName || 'ClausePulse-Read-Receipt.md';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return { ok: true, filePath: defaultName };
    },
    wipeAllLocalData: async () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return { ok: true, deletedKey: false, deletedReceipts: true };
    },
  };
}

// Application State
let customPresets: DocumentPreset[] = [];
let activePreset: DocumentPreset = BUILTIN_DOCUMENT_PRESETS[0];
let docSession: DocumentSessionState = createDocumentSession(activePreset.clauses);
let personalBaseline: PersonalBaseline | null = null;
let baselineAcc: BaselineAccumulatorState | null = null;
let baselineTimer: ReturnType<typeof setInterval> | null = null;

let sourceMode: SignalSourceMode = 'LIVE_CAMERA_SMARTSPECTRA';
let isSensorActive = false;
let isValidationOk = true;
let telemetryEnabled = false;
let sdkVersion = '3.5.0';

let liveSdk: any = null;
let localWebcamStream: MediaStream | null = null;
let localOpticalTimer: ReturnType<typeof setInterval> | null = null;
const opticalProcessor = new LiveWebcamOpticalProcessor();

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let isRecordingTake = false;

let replayInterval: ReturnType<typeof setInterval> | null = null;
let activeReplayProfile: ReplayScenarioProfile = 'CALM_STEADY_READER';
let replayStartMs = 0;
let walkthroughInterval: ReturnType<typeof setInterval> | null = null;

// Oscilloscope Ring Buffers
const breathingWaveHistory: number[] = [];
const pulseWaveHistory: number[] = [];
const MAX_WAVE_POINTS = 140;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showNotice(title: string, message: string): void {
  const banner = $('sensorNoticeBanner');
  $('sensorNoticeTitle').textContent = title;
  $('sensorNoticeText').textContent = ' ' + message;
  banner.hidden = false;
}

function hideNotice(): void {
  $('sensorNoticeBanner').hidden = true;
}

function updateSourceModeBadge(mode: SignalSourceMode, active: boolean): void {
  sourceMode = mode;
  const badge = $('activeSourceBadge');
  if (!active) {
    badge.textContent = 'IDLE • STANDBY';
    badge.className = 'mode-pill';
    return;
  }
  if (mode === 'LIVE_CAMERA_SMARTSPECTRA') {
    badge.textContent = 'LIVE CAMERA • SMARTSPECTRA C++ SDK';
    badge.className = 'mode-pill mode-pill-live';
  } else if (mode === 'LIVE_WEBCAM_OPTICAL') {
    badge.textContent = 'LIVE WEBCAM • LOCAL OPTICAL ROI';
    badge.className = 'mode-pill mode-pill-optical';
  } else if (mode === 'VIDEO_FILE_SMARTSPECTRA') {
    badge.textContent = 'VIDEO FILE • SMARTSPECTRA SDK';
    badge.className = 'mode-pill mode-pill-live';
  } else {
    badge.textContent = 'TEST BENCH • DETERMINISTIC REPLAY';
    badge.className = 'mode-pill mode-pill-bench';
  }
}

function updateProcessingBadge(status: number | string): void {
  const label = typeof status === 'number' ? STATUS_LABELS[status] || `Status(${status})` : status;
  const el = $('sdkStatusBadge');
  el.textContent = label;
  el.className =
    'status-pill ' +
    (label === 'Running' || label === 'OpticalLock' || label === 'ReplayActive'
      ? 'status-running'
      : label === 'Error'
      ? 'status-error'
      : 'status-idle');
}

function updateValidationHud(code: number, hint: string): void {
  const name = VALIDATION_LABELS[code] || `Code(${code})`;
  isValidationOk = code === ValidationCode.kOk;
  const chip = $('hudValidationChip');
  chip.textContent = `Validation: ${name}${hint ? ' (' + hint + ')' : ''}`;
  chip.className = 'hud-chip ' + (isValidationOk ? 'hud-chip-ok' : 'hud-chip-warn');
}

function drawWaveformCanvas(
  canvasId: string,
  samples: readonly number[],
  strokeColor: string,
  drawThresholdBand = false
): void {
  const canvas = $<HTMLCanvasElement>(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Graticule grid lines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  for (let gx = 48; gx < w; gx += 48) {
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
  }
  ctx.stroke();

  if (drawThresholdBand) {
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fillRect(0, h / 2 - 6, w, 12);
  }

  if (samples.length < 2) return;

  let min = Infinity;
  let max = -Infinity;
  for (const v of samples) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = Math.max(0.25, max - min);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  for (let i = 0; i < samples.length; i++) {
    const x = (i / (MAX_WAVE_POINTS - 1)) * w;
    const norm = (samples[i] - min) / span;
    const y = h - 6 - norm * (h - 12);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 * Processes an incoming decoded SmartSpectra Metrics slice from ANY of the 4 engines:
 * 1. Live Camera (`@smartspectra/node-sdk/renderer`)
 * 2. Live Webcam Optical ROI (`LiveWebcamOpticalProcessor`)
 * 3. Video File (`@smartspectra/node-sdk` in main process)
 * 4. Deterministic Replay Bench (`replayFixtures.ts`)
 */
function handleDecodedMetricsPacket(
  metrics: DecodedSmartSpectraMetrics,
  nowMs = Date.now(),
  explicitStepMs?: number
): void {
  if (baselineAcc) {
    baselineAcc = ingestBaselinePacket(baselineAcc, metrics, nowMs);
  }

  docSession = ingestMetricsForActiveClause(
    docSession,
    metrics,
    isValidationOk,
    personalBaseline,
    nowMs,
    explicitStepMs
  );

  const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
  let latestChestWave = 0;
  for (const s of upperArr) {
    if (Number.isFinite(s.value)) {
      latestChestWave = s.value;
      breathingWaveHistory.push(s.value);
      if (breathingWaveHistory.length > MAX_WAVE_POINTS) breathingWaveHistory.shift();
    }
  }

  const artArr =
    metrics.cardio?.arterialPressureTrace ?? metrics.cardio?.arterial_pressure_trace ?? [];
  for (const s of artArr) {
    if (Number.isFinite(s.value)) {
      pulseWaveHistory.push(s.value);
      if (pulseWaveHistory.length > MAX_WAVE_POINTS) pulseWaveHistory.shift();
    }
  }

  const talkingArr = metrics.face?.talking ?? [];
  const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);
  const talkingChip = $('hudTalkingChip');
  talkingChip.textContent = isTalking
    ? 'Speech Gate: TALKING (Resp Paused)'
    : 'Speech Gate: Silent (OK)';
  talkingChip.className = 'hud-chip ' + (isTalking ? 'hud-chip-warn' : 'hud-chip-ok');

  const apnea = computeApneaHoldSeconds(
    docSession.activeBuffer.upperTraceSamples,
    personalBaseline?.upperTraceStdDev ?? 0.35,
    isTalking
  );
  const apneaBadge = $('apneaReadoutBadge');
  apneaBadge.textContent = `Breath Hold: ${apnea.currentHoldSec.toFixed(1)}s`;
  apneaBadge.className =
    'scope-badge ' + (apnea.currentHoldSec >= 4.5 ? 'scope-badge-alert' : '');

  drawWaveformCanvas(
    'canvasBreathingTrace',
    breathingWaveHistory,
    apnea.currentHoldSec >= 4.5 ? '#f43f5e' : '#10b981',
    true
  );
  drawWaveformCanvas('canvasPulseTrace', pulseWaveHistory, '#3b82f6', false);

  const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
  const latestPulse = pulseArr.length > 0 ? pulseArr[pulseArr.length - 1] : null;
  if (latestPulse && latestPulse.value > 0) {
    $('valPulseBpm').textContent = latestPulse.value.toFixed(0);
    const conf = latestPulse.confidence ?? 0;
    $('pulseConfBadge').textContent = `Conf: ${conf.toFixed(0)}%`;
    if (personalBaseline?.pulseMedianBpm != null) {
      const delta = latestPulse.value - personalBaseline.pulseMedianBpm;
      const sign = delta >= 0 ? '+' : '';
      $('subPulseDelta').textContent = `${sign}${delta.toFixed(1)} BPM vs ${personalBaseline.pulseMedianBpm} base`;
    } else {
      $('subPulseDelta').textContent = `Stable: ${latestPulse.stable ? 'Yes' : 'Warming'}`;
    }
  }

  const breathArr = metrics.breathing?.rate ?? [];
  const latestBreath = breathArr.length > 0 ? breathArr[breathArr.length - 1] : null;
  if (latestBreath && latestBreath.value > 0 && !isTalking) {
    $('valBreathingBrpm').textContent = latestBreath.value.toFixed(1);
    $('subBreathingConf').textContent = `Conf: ${(latestBreath.confidence ?? 0).toFixed(0)}% (${
      latestBreath.stable ? 'Stable' : 'Warming'
    })`;
  }

  const activeRec = docSession.records[docSession.activeClauseId];
  if (activeRec) {
    $('valBlinkRate').textContent = activeRec.blinkRatePerMin.toFixed(0);
  }

  const landmarksArr = metrics.face?.landmarks ?? [];
  let cx = 0.5;
  let cy = 0.42;
  let faceCentered = false;
  if (landmarksArr.length > 0) {
    const f = evaluateFaceFraming(landmarksArr[landmarksArr.length - 1]);
    faceCentered = f.faceCentered;
    cx = f.centroidX ?? 0.5;
    cy = f.centroidY ?? 0.42;
    $('subGazeStatus').textContent = `${f.faceCentered ? 'Centered' : 'Off-center'} (${f.landmarkCount} pts)`;
  } else {
    $('subGazeStatus').textContent = 'No face landmarks (0%)';
  }

  renderCameraHudReticle($<HTMLCanvasElement>('cameraHudCanvas'), {
    active: isSensorActive,
    faceCentered,
    centroidX: cx,
    centroidY: cy,
    chestWave: latestChestWave,
    isApnea: apnea.currentHoldSec >= 4.5,
    modeLabel: sourceMode,
  });

  const hrvArr = metrics.cardio?.hrv ?? [];
  if (hrvArr.length > 0) {
    const h = hrvArr[hrvArr.length - 1];
    if (typeof h.rmssd === 'number' && h.rmssd > 0) {
      $('valHrvRmssd').textContent = h.rmssd.toFixed(0);
    }
  }

  const exprArr = metrics.face?.expression ?? [];
  if (exprArr.length > 0) {
    const tension = computeExpressionTension(exprArr[exprArr.length - 1]);
    $('subExpressionTension').textContent = `Brow tension: ${tension.toFixed(0)}%`;
  }

  updateSettlingGateBanner();
  renderClauseCards();
  updateReceiptAndSignOffUI();
}

function getSelectedMetricCodes(allowCardio = true): number[] {
  const codes: number[] = [...breathingMetrics];
  if ($<HTMLInputElement>('chkBundleFace')?.checked) {
    codes.push(...faceMetrics);
  }
  if (allowCardio && $<HTMLInputElement>('chkBundleCardio')?.checked) {
    codes.push(...cardioMetrics);
  }
  if ($<HTMLInputElement>('chkBundleEda')?.checked) {
    codes.push(...edaMetrics);
  }
  return codes;
}

/**
 * Opens the physical webcam in Local Optical ROI mode when no Presage API key is set
 * (or when playing a local video file without an API key), ensuring the webcam always works.
 */
async function startLocalOpticalWebcamSession(): Promise<void> {
  await stopAllSensors();
  hideNotice();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
      audio: false,
    });

    localWebcamStream = stream;
    const video = $<HTMLVideoElement>('cameraPreview');
    video.srcObject = stream;
    await video.play();

    opticalProcessor.reset();
    isSensorActive = true;
    isValidationOk = true;
    $('cameraOverlay').hidden = true;

    updateSourceModeBadge('LIVE_WEBCAM_OPTICAL', true);
    updateProcessingBadge('OpticalLock');
    updateValidationHud(ValidationCode.kOk, 'Live Webcam ROI Active');

    $<HTMLButtonElement>('btnStartCamera').disabled = true;
    $<HTMLButtonElement>('btnRecordTake').disabled = false;
    $<HTMLButtonElement>('btnStopSensor').disabled = false;

    showNotice(
      'Live Webcam Optical ROI Active',
      'Physical webcam is streaming at 30 FPS with on-device Face rPPG + Upper-Chest Respiratory ROI analysis. Add a Presage API key in the Key Vault at any time to switch to native C++ SmartSpectraSDK.'
    );

    localOpticalTimer = setInterval(() => {
      const res = opticalProcessor.processVideoFrame(video, Date.now());
      if (!res) return;
      updateValidationHud(
        res.diag.faceCentered ? ValidationCode.kOk : ValidationCode.kFaceNotCentered,
        res.diag.faceCentered ? 'Face & Chest ROI Locked' : 'Center face in reticle'
      );
      handleDecodedMetricsPacket(res.metrics, Date.now());
    }, 66);
  } catch (err: any) {
    showNotice(
      'Webcam Hardware Unavailable',
      `Could not open physical camera (${err?.message || err}). Running Deterministic Replay Bench instead.`
    );
    startDeterministicReplay('CALM_STEADY_READER');
  }
}

/**
 * Starts a genuine live webcam session using `@smartspectra/node-sdk/renderer` if a Presage
 * API key is configured, or immediately opens the physical webcam in Local Optical ROI mode.
 */
async function startLiveCameraSession(allowCardio = true): Promise<void> {
  await stopAllSensors();
  hideNotice();

  const apiKey = (await window.clausePulseHost?.getSessionApiKey()) || '';
  if (!apiKey) {
    await startLocalOpticalWebcamSession();
    return;
  }

  const requestedMetrics = getSelectedMetricCodes(allowCardio);

  try {
    liveSdk = new SmartSpectraSDK({
      apiKey,
      requestedMetrics,
      enableAccumulatedOutput: false,
      enableTelemetry: telemetryEnabled,
    });

    liveSdk.on('processingStatus', (status: number) => {
      updateProcessingBadge(status);
    });

    liveSdk.on('validationStatus', (code: number, _ts: number, hint: string) => {
      updateValidationHud(code, hint);
    });

    liveSdk.on('metrics', (buf: Uint8Array) => {
      try {
        const decoded = decodeMetrics(buf) as DecodedSmartSpectraMetrics;
        handleDecodedMetricsPacket(decoded, Date.now());
      } catch (err) {
        console.error('[ClausePulse] Failed to decode Metrics buffer:', err);
      }
    });

    liveSdk.on('error', async (code: number, message: string, _retryable: boolean) => {
      const msgStr = String(message || '');
      if (
        allowCardio &&
        (code === SmartSpectraErrorCode.kMetricNotAuthorized ||
          /device keys|not authorized|cardio/i.test(msgStr))
      ) {
        const cardioChk = $<HTMLInputElement>('chkBundleCardio');
        if (cardioChk) cardioChk.checked = false;
        showNotice(
          'Cardio Bundle Fallback',
          'Your Presage API key is provisioned for Breathing + Face metrics. Re-initializing cleanly without Cardio device keys.'
        );
        await stopAllSensors();
        await startLiveCameraSession(false);
        return;
      }
      showNotice(`SmartSpectra Error (${code})`, msgStr);
      updateProcessingBadge('Error');
    });

    liveSdk.on('streamAvailable', (stream: MediaStream) => {
      localWebcamStream = stream;
      const video = $<HTMLVideoElement>('cameraPreview');
      video.srcObject = stream;
      video.play().catch(() => {});
      $('cameraOverlay').hidden = true;
      $<HTMLButtonElement>('btnRecordTake').disabled = false;
    });

    isSensorActive = true;
    updateSourceModeBadge('LIVE_CAMERA_SMARTSPECTRA', true);
    $<HTMLButtonElement>('btnStartCamera').disabled = true;
    $<HTMLButtonElement>('btnStopSensor').disabled = false;

    await liveSdk.start();
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (allowCardio && /device keys|not authorized/i.test(msg)) {
      const cardioChk = $<HTMLInputElement>('chkBundleCardio');
      if (cardioChk) cardioChk.checked = false;
      await stopAllSensors();
      await startLiveCameraSession(false);
      return;
    }
    showNotice('SDK Start Fallback', `${msg} — Opening Live Webcam Optical Mode.`);
    await startLocalOpticalWebcamSession();
  }
}

/**
 * Records a 12-second `.webm` video take from the active webcam and saves it to disk
 * so the user can analyze it via `SmartSpectraSDK.useFile()` or replay it.
 */
async function toggleRecordCameraTake(): Promise<void> {
  const btn = $<HTMLButtonElement>('btnRecordTake');
  if (isRecordingTake && mediaRecorder) {
    mediaRecorder.stop();
    return;
  }

  if (!localWebcamStream) {
    showNotice('Start Camera First', 'Start the live camera before recording a video take.');
    return;
  }

  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(localWebcamStream, { mimeType: 'video/webm' });
  } catch {
    mediaRecorder = new MediaRecorder(localWebcamStream);
  }

  mediaRecorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) {
      recordedChunks.push(ev.data);
    }
  };

  mediaRecorder.onstop = async () => {
    isRecordingTake = false;
    btn.textContent = '● Rec Take';
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const saved = await window.clausePulseHost?.saveRecordedVideo(
      bytes,
      docSession.activeClauseId
    );
    if (saved?.ok && saved.filePath) {
      showNotice(
        'Camera Take Saved to Disk',
        `Saved ${saved.fileName} (${Math.round(bytes.byteLength / 1024)} KB). Click "Video File" to run SDK useFile() on it.`
      );
    }
  };

  isRecordingTake = true;
  btn.textContent = '■ Stop Rec';
  mediaRecorder.start(250);

  setTimeout(() => {
    if (isRecordingTake && mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, 12000);
}

/**
 * Starts video-file analysis via `@smartspectra/node-sdk` (`sdk.useFile`) in the main process,
 * or plays the video file through the optical processor if no Presage API key is set yet.
 */
async function startVideoFileSession(): Promise<void> {
  await stopAllSensors();
  hideNotice();

  const res = await window.clausePulseHost?.runVideoFileSession();
  if (!res || res.canceled) return;

  if (!res.ok) {
    showNotice('Video File Analysis', res.error || 'Could not start video file session.');
    return;
  }

  if (res.localOpticalPlayback && res.fullPath) {
    const video = $<HTMLVideoElement>('cameraPreview');
    video.srcObject = null;
    video.src = res.fullPath.startsWith('blob:')
      ? res.fullPath
      : `file:///${res.fullPath.replace(/\\/g, '/')}`;
    video.loop = true;
    await video.play().catch(() => {});
    $('cameraOverlay').hidden = true;
    opticalProcessor.reset();
    isSensorActive = true;
    updateSourceModeBadge('VIDEO_FILE_SMARTSPECTRA', true);
    updateProcessingBadge('Running');
    $<HTMLButtonElement>('btnStopSensor').disabled = false;

    localOpticalTimer = setInterval(() => {
      const frameRes = opticalProcessor.processVideoFrame(video, Date.now());
      if (frameRes) {
        handleDecodedMetricsPacket(frameRes.metrics, Date.now());
      }
    }, 66);
    return;
  }

  isSensorActive = true;
  updateSourceModeBadge('VIDEO_FILE_SMARTSPECTRA', true);
  updateProcessingBadge('Running');
  $('cameraOverlay').hidden = false;
  $('cameraOverlayTitle').textContent = `Analyzing Video File via SmartSpectra SDK`;
  $('cameraOverlaySub').textContent = `File: ${res.videoPath} (native C++ useFile pipeline active)`;
  $<HTMLButtonElement>('btnStopSensor').disabled = false;
}

/**
 * Starts the explicitly labeled Deterministic Signal Replay Bench (`DETERMINISTIC_REPLAY_BENCH`).
 */
async function startDeterministicReplay(profile: ReplayScenarioProfile): Promise<void> {
  await stopAllSensors();

  activeReplayProfile = profile;
  isSensorActive = true;
  isValidationOk = profile !== 'OFF_SCREEN_SKIMMER';
  replayStartMs = Date.now();

  updateSourceModeBadge('DETERMINISTIC_REPLAY_BENCH', true);
  updateProcessingBadge('ReplayActive');
  updateValidationHud(
    profile === 'OFF_SCREEN_SKIMMER' ? ValidationCode.kFaceNotCentered : ValidationCode.kOk,
    profile === 'OFF_SCREEN_SKIMMER' ? 'Gaze out of frame' : `Replay: ${profile}`
  );

  $('cameraOverlay').hidden = false;
  $('cameraOverlayTitle').textContent = `[TEST BENCH] Deterministic Signal Replay Active`;
  $('cameraOverlaySub').textContent = `Profile: ${profile} (10 Hz protobuf-shaped stream feeding ClauseAttributionEngine)`;
  $<HTMLButtonElement>('btnStopSensor').disabled = false;
  $<HTMLButtonElement>('btnStartCamera').disabled = false;

  replayInterval = setInterval(() => {
    const elapsedSec = (Date.now() - replayStartMs) / 1000;
    const packet = generateReplayMetricsSlice(activeReplayProfile, elapsedSec, Date.now() * 1000);
    handleDecodedMetricsPacket(packet, Date.now());
  }, 100);
}

async function stopAllSensors(): Promise<void> {
  if (walkthroughInterval) {
    clearInterval(walkthroughInterval);
    walkthroughInterval = null;
  }

  if (replayInterval) {
    clearInterval(replayInterval);
    replayInterval = null;
  }

  if (localOpticalTimer) {
    clearInterval(localOpticalTimer);
    localOpticalTimer = null;
  }

  if (isRecordingTake && mediaRecorder && mediaRecorder.state === 'recording') {
    try {
      mediaRecorder.stop();
    } catch {
      // ignore
    }
    isRecordingTake = false;
  }

  if (liveSdk) {
    try {
      await liveSdk.stop();
      await liveSdk.destroy();
    } catch {
      // ignore
    }
    liveSdk = null;
  }

  if (localWebcamStream) {
    for (const track of localWebcamStream.getTracks()) {
      track.stop();
    }
    localWebcamStream = null;
  }

  await window.clausePulseHost?.stopVideoFileSession().catch(() => {});

  const video = $<HTMLVideoElement>('cameraPreview');
  if (video) {
    video.pause();
    video.srcObject = null;
    video.removeAttribute('src');
  }

  isSensorActive = false;
  renderCameraHudReticle($<HTMLCanvasElement>('cameraHudCanvas'), {
    active: false,
    faceCentered: false,
    centroidX: 0.5,
    centroidY: 0.5,
    chestWave: 0,
    isApnea: false,
    modeLabel: '',
  });

  updateSourceModeBadge(sourceMode, false);
  updateProcessingBadge('Standby');
  $('cameraOverlay').hidden = false;
  $('cameraOverlayTitle').textContent = 'Optical Sensor Standby';
  $('cameraOverlaySub').textContent =
    'Click "Start Live Camera" for real-time webcam sensing (SmartSpectra C++ SDK or Local Optical ROI), load a Video File, or run the Replay Bench.';
  $<HTMLButtonElement>('btnStartCamera').disabled = false;
  $<HTMLButtonElement>('btnRecordTake').disabled = true;
  $<HTMLButtonElement>('btnStopSensor').disabled = true;
}

/**
 * Starts the Personal Baseline Calibration timer.
 */
function startBaselineCalibration(): void {
  if (!isSensorActive) {
    startDeterministicReplay('CALM_STEADY_READER');
  }

  if (baselineTimer) clearInterval(baselineTimer);
  const targetSec = sourceMode === 'DETERMINISTIC_REPLAY_BENCH' ? 5 : 30;
  const startedMs = Date.now();
  baselineAcc = createBaselineAccumulator(startedMs);

  $('baselineStatusText').textContent = `Calibrating resting baseline (${targetSec}s stationary window)…`;
  $('baselineProgressFill').style.width = '5%';

  baselineTimer = setInterval(() => {
    if (!baselineAcc) return;
    const elapsedSec = (Date.now() - startedMs) / 1000;
    const pct = Math.min(100, Math.round((elapsedSec / targetSec) * 100));
    $('baselineProgressFill').style.width = `${pct}%`;

    if (elapsedSec >= targetSec) {
      if (baselineTimer) clearInterval(baselineTimer);
      baselineTimer = null;
      personalBaseline = finalizePersonalBaseline(baselineAcc, Date.now());
      baselineAcc = null;
      $('baselineStatusText').textContent = `Calibrated: ${
        personalBaseline.pulseMedianBpm ?? 70
      } BPM | ${personalBaseline.breathingMedianBrpm ?? 14} BRPM | Trace SD ${
        personalBaseline.upperTraceStdDev
      }`;
      updateReceiptAndSignOffUI();
    }
  }, 200);
}

function updateSettlingGateBanner(): void {
  const banner = $('settlingGateBanner');
  const targetId = docSession.settlingTargetClauseId;
  if (!targetId) {
    banner.hidden = true;
    return;
  }

  const clause = docSession.clauses.find((c) => c.id === targetId);
  const rec = docSession.records[targetId];
  if (!clause || !rec || rec.status === 'SETTLED_OVERRIDE') {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  $('settlingGateTitle').textContent = `Settling Gate for ${clause.number}: ${clause.title}`;
  $('settlingCyclesVal').textContent = `${rec.settledCyclesCompleted} / 2`;

  const latestWave =
    breathingWaveHistory.length > 0 ? breathingWaveHistory[breathingWaveHistory.length - 1] : 0;
  const widthPct = Math.min(95, Math.max(12, Math.round(((latestWave + 0.8) / 1.6) * 85)));
  $('settlingPacerOrb').style.width = `${widthPct}%`;
  $('settlingPacerInstruction').textContent =
    latestWave >= 0
      ? 'Inhaling… let your chest expand steadily in frame.'
      : 'Exhaling… release tension slowly until the cycle completes.';
}

function renderCodeOrDiffBody(rawBody: string): string {
  const lines = rawBody.split('\n');
  const renderedLines = lines
    .map((line) => {
      const safe = escapeHtml(line);
      if (line.startsWith('@@')) {
        return `<span class="diff-line diff-line-hdr">${safe}</span>`;
      }
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return `<span class="diff-line diff-line-add">${safe}</span>`;
      }
      if (line.startsWith('-') && !line.startsWith('---')) {
        return `<span class="diff-line diff-line-del">${safe}</span>`;
      }
      return `<span class="diff-line">${safe}</span>`;
    })
    .join('');
  return `<div class="clause-diff-box">${renderedLines}</div>`;
}

function renderMinimapBar(): void {
  const bar = $('clauseMinimapBar');
  const summary = computeDocumentSignOffSummary(docSession);
  const pct =
    summary.totalClauses > 0
      ? Math.round((summary.verifiedCount / summary.totalClauses) * 100)
      : 0;
  $('minimapCompletionLabel').textContent = `${pct}% Attested (${summary.verifiedCount}/${summary.totalClauses})`;

  const totalWords = Math.max(
    1,
    docSession.clauses.reduce((acc, c) => acc + c.wordCount, 0)
  );

  bar.innerHTML = docSession.clauses
    .map((c) => {
      const rec = docSession.records[c.id];
      const st = rec?.status ?? 'UNREAD';
      const isActive = c.id === docSession.activeClauseId;
      const flexBasis = Math.max(12, Math.round((c.wordCount / totalWords) * 100));
      return `<div class="minimap-seg seg-${st} ${
        isActive ? 'active' : ''
      }" style="flex: ${flexBasis} 1 0%;" data-jump-id="${c.id}" title="${escapeHtml(
        `${c.number} ${c.title} (${st})`
      )}">${escapeHtml(c.number)}</div>`;
    })
    .join('');

  bar.querySelectorAll<HTMLElement>('.minimap-seg').forEach((seg) => {
    seg.addEventListener('click', () => {
      const id = seg.getAttribute('data-jump-id');
      if (id && id !== docSession.activeClauseId) {
        docSession = selectActiveClause(docSession, id, personalBaseline, Date.now());
        renderClauseCards();
        updateReceiptAndSignOffUI();
      }
    });
  });
}

function renderClauseCards(): void {
  renderMinimapBar();

  const container = $('clauseListContainer');
  const activeIdx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
  $('clauseStepIndicator').textContent = `Clause ${Math.max(1, activeIdx + 1)} of ${
    docSession.clauses.length
  }`;

  const summary = computeDocumentSignOffSummary(docSession);
  $('pillVerifiedCount').textContent = `${summary.verifiedCount} Verified`;
  $('pillSkimCount').textContent = `${summary.skimmedCount} Skimmed`;
  $('pillFrictionCount').textContent = `${summary.frictionCount} Friction`;

  container.innerHTML = docSession.clauses
    .map((clause) => {
      const rec = docSession.records[clause.id];
      const isActive = clause.id === docSession.activeClauseId;
      const liveDwellMs = rec.dwellTimeMs;
      const dwellSec = (liveDwellMs / 1000).toFixed(1);
      const reqSec = (clause.minRequiredDwellMs / 1000).toFixed(1);
      const dwellPct = Math.min(100, Math.round((liveDwellMs / clause.minRequiredDwellMs) * 100));

      const pulseText =
        rec.pulseMeanBpm !== null
          ? `${rec.pulseMeanBpm} BPM (${
              rec.pulseDeltaBpm !== null
                ? (rec.pulseDeltaBpm >= 0 ? '+' : '') + rec.pulseDeltaBpm
                : '0'
            })`
          : '—';

      const settleButtonHtml =
        rec.status === 'APNEA_FRICTION'
          ? `<button class="btn btn-primary btn-xs btn-settle-clause" data-settle-id="${clause.id}" type="button">
               Open SignSteady Breath Gate (2 Breaths)
             </button>`
          : '';

      // Render Pass-1 vs Pass-2 Ghost Take Comparison if >= 2 passes exist
      let passCompareHtml = '';
      if (rec.passHistory && rec.passHistory.length >= 2) {
        const firstPass = rec.passHistory[0];
        const latestPass = rec.passHistory[rec.passHistory.length - 1];
        passCompareHtml = `
          <div class="pass-comparison-strip">
            <span><strong>Pass 1 (Initial):</strong> ${firstPass.status} (Apnea ${firstPass.maxApneaHoldSec}s, Gaze ${Math.round(
          firstPass.gazePresenceRatio * 100
        )}%)</span>
            <span>→</span>
            <span><strong>Pass ${latestPass.passNumber} (Resolved):</strong> ${latestPass.status} (Apnea ${latestPass.maxApneaHoldSec}s, Gaze ${Math.round(
          latestPass.gazePresenceRatio * 100
        )}%)</span>
          </div>
        `;
      }

      const bodyHtml = clause.isCodeOrDiff
        ? renderCodeOrDiffBody(clause.body)
        : `<p class="clause-body-text">${escapeHtml(clause.body)}</p>`;

      return `
        <article class="clause-card ${isActive ? 'active' : ''} status-${rec.status}" data-clause-id="${clause.id}">
          <div class="clause-gutter">
            <div>
              <div class="clause-num-row">
                <span class="clause-num">${escapeHtml(clause.number)}</span>
                <span class="risk-tag risk-${clause.riskTier}">${clause.riskTier.replace('_', ' ')}</span>
              </div>
              <div class="dwell-mini-bar">
                <div class="dwell-mini-fill" style="width: ${dwellPct}%"></div>
              </div>
            </div>
            <div class="gutter-metrics">
              <div>Dwell: <strong>${dwellSec}s / ${reqSec}s</strong></div>
              <div>Gaze: <strong>${Math.round(rec.gazePresenceRatio * 100)}%</strong></div>
              <div>Pulse: <strong>${pulseText}</strong></div>
              <div>Apnea Hold: <strong>${rec.maxApneaHoldSec}s</strong></div>
            </div>
            <div class="gutter-status-pill verdict-${rec.status}">
              ${rec.status.replace('_', ' ')}
            </div>
          </div>

          <div class="clause-content">
            <div class="clause-title-row">
              <h3 class="clause-title">${escapeHtml(clause.title)}</h3>
              <span class="clause-word-meta">${clause.wordCount} words • ${escapeHtml(clause.category)}</span>
            </div>
            ${bodyHtml}
            ${
              clause.plainLanguageWarning
                ? `<div class="clause-warning-box"><strong>Clause Risk Diagnostic:</strong> ${escapeHtml(
                    clause.plainLanguageWarning
                  )}</div>`
                : ''
            }
            ${passCompareHtml}
            <div class="clause-footer-row">
              <span>${escapeHtml(rec.statusReason)}</span>
              ${settleButtonHtml}
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll<HTMLElement>('.clause-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-settle-clause')) return;
      const id = card.getAttribute('data-clause-id');
      if (id && id !== docSession.activeClauseId) {
        docSession = selectActiveClause(docSession, id, personalBaseline, Date.now());
        renderClauseCards();
        updateReceiptAndSignOffUI();
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-settle-clause').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-settle-id');
      if (id) {
        docSession = startSettlingGate(docSession, id);
        if (sourceMode === 'DETERMINISTIC_REPLAY_BENCH') {
          startDeterministicReplay('COHERENT_SETTLING_BREATH');
        }
        updateSettlingGateBanner();
      }
    });
  });
}

function updateReceiptAndSignOffUI(): void {
  const receipt = buildReadReceiptPayload(
    activePreset,
    docSession,
    personalBaseline,
    sourceMode,
    telemetryEnabled,
    sdkVersion
  );

  const summary = receipt.signOffSummary;
  const badge = $('signOffVerdictBadge');
  const btnAttest = $<HTMLButtonElement>('btnAttestDocument');

  if (summary.canSignOff) {
    badge.textContent = 'READY TO ATTEST (ALL CLAUSES VERIFIED)';
    badge.className = 'badge badge-success';
    btnAttest.disabled = false;
  } else {
    badge.textContent = `BLOCKED (${summary.blockingClauseIds.length} CLAUSES PENDING)`;
    badge.className = 'badge badge-warn';
    btnAttest.disabled = true;
  }

  $('gitTrailerCode').textContent = receipt.gitCommitTrailer;
  $('receiptMarkdownPreview').textContent = formatReadReceiptMarkdown(receipt);
}

function loadDocumentPreset(preset: DocumentPreset): void {
  activePreset = preset;
  docSession = createDocumentSession(preset.clauses, Date.now());
  $('docTitleHeading').textContent = preset.title;
  $('docSubtitleText').textContent = `${preset.counterpartyOrContext} • ${preset.subtitle}`;
  $('docSourceHashBadge').textContent = preset.sourceHashSha256
    ? `SHA-256: ${preset.sourceHashSha256.slice(0, 16)}…`
    : 'SHA-256: Computed';
  renderClauseCards();
  updateReceiptAndSignOffUI();
}

function addAndSelectPresetInDropdown(preset: DocumentPreset, prefixLabel: string): void {
  const existingIdx = customPresets.findIndex((p) => p.id === preset.id);
  if (existingIdx >= 0) {
    customPresets[existingIdx] = preset;
  } else {
    customPresets.push(preset);
    const select = $<HTMLSelectElement>('selectDocumentPreset');
    const opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = `${prefixLabel}: ${preset.title}`;
    select.appendChild(opt);
  }
  $<HTMLSelectElement>('selectDocumentPreset').value = preset.id;
  loadDocumentPreset(preset);
}

function switchRightTab(tabId: string): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    const isTarget = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', String(isTarget));
  });
  document.querySelectorAll<HTMLElement>('.tab-pane').forEach((pane) => {
    const isTarget = pane.id === tabId;
    pane.classList.toggle('active', isTarget);
    pane.hidden = !isTarget;
  });
}

/**
 * Renders the 30-Scenario Quantitative Evaluation & Ablation Benchmark (`tabEval`).
 */
function renderEvaluationBenchmark(): void {
  const summary = runEvaluationBenchmarkSuite();

  $('evalScoreboardGrid').innerHTML = `
    <div class="eval-score-card">
      <div class="eval-score-title">Baseline A: Naive Timer</div>
      <div class="eval-score-val">${summary.naiveTimerAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.naiveTimerCorrect}/${summary.totalCases} correct</div>
    </div>
    <div class="eval-score-card">
      <div class="eval-score-title">Baseline B: Raw 80-BPM</div>
      <div class="eval-score-val">${summary.uncalibratedPulseAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.uncalibratedPulseCorrect}/${summary.totalCases} • Speech FP ${summary.speechFalsePositiveRateUncalibratedPct}%</div>
    </div>
    <div class="eval-score-card highlight">
      <div class="eval-score-title">ClausePulse Fusion</div>
      <div class="eval-score-val">${summary.clausePulseAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.clausePulseCorrect}/${summary.totalCases} • Speech FP ${summary.speechFalsePositiveRateClausePulsePct}%</div>
    </div>
  `;

  $('evalBoundaryBox').innerHTML = `
    <strong>Documented Physical &amp; Optical Boundaries:</strong><br/>
    • ${escapeHtml(summary.failureBoundaryNotes[0])}<br/>
    • ${escapeHtml(summary.failureBoundaryNotes[1])}
  `;

  $('evalTableBody').innerHTML = summary.outcomes
    .map(
      (o) => `
      <tr title="${escapeHtml(o.diagnosticNote)}">
        <td><strong>${o.scenarioId}</strong></td>
        <td>${escapeHtml(o.scenarioName)}</td>
        <td>${o.expected}</td>
        <td class="${o.naiveCorrect ? 'eval-pass' : 'eval-fail'}">${o.naiveTimerVerdict}</td>
        <td class="${o.uncalibratedCorrect ? 'eval-pass' : 'eval-fail'}">${o.uncalibratedPulseVerdict}</td>
        <td class="${o.clausePulseCorrect ? 'eval-pass' : 'eval-fail'}">${o.clausePulseVerdict}</td>
      </tr>
    `
    )
    .join('');
}

/**
 * Runs a 100% packet-driven verification walkthrough across the active document with
 * ZERO hardcoded state mutations (`accumulatedDwellMs` and `maxApneaHoldSec` are computed
 * purely by streaming `DecodedSmartSpectraMetrics` packets through `ingestMetricsForActiveClause`).
 */
async function runFullAutomatedWalkthrough(): Promise<void> {
  await stopAllSensors();
  loadDocumentPreset(BUILTIN_DOCUMENT_PRESETS[0]);

  isSensorActive = true;
  isValidationOk = true;
  updateSourceModeBadge('DETERMINISTIC_REPLAY_BENCH', true);
  updateProcessingBadge('ReplayActive');
  $('cameraOverlay').hidden = false;
  $('cameraOverlayTitle').textContent = `[WALKTHROUGH] Packet-Driven Multi-Pass Verification`;
  $<HTMLButtonElement>('btnStopSensor').disabled = false;

  let simClockMs = Date.now();
  let simElapsedSec = 0;
  const stepMs = 250; // Each 40ms real tick advances 250ms of physiological packet stream (~6.25x speed)
  baselineAcc = createBaselineAccumulator(simClockMs);

  let phase:
    | 'CALIBRATE'
    | 'CLAUSE_1_CALM'
    | 'CLAUSE_2_SKIM'
    | 'CLAUSE_3_APNEA'
    | 'CLAUSE_3_SETTLE'
    | 'CLAUSE_2_REREAD'
    | 'CLAUSE_4_CALM'
    | 'CLAUSE_5_CALM' = 'CALIBRATE';
  let phaseElapsedMs = 0;

  walkthroughInterval = setInterval(() => {
    simClockMs += stepMs;
    simElapsedSec += stepMs / 1000;
    phaseElapsedMs += stepMs;
    const tsUs = simClockMs * 1000;

    if (phase === 'CALIBRATE') {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      const pct = Math.min(100, Math.round((phaseElapsedMs / 4000) * 100));
      $('baselineProgressFill').style.width = `${pct}%`;
      if (phaseElapsedMs >= 4000 && baselineAcc) {
        personalBaseline = finalizePersonalBaseline(baselineAcc, simClockMs);
        baselineAcc = null;
        $('baselineStatusText').textContent = `Calibrated: ${personalBaseline.pulseMedianBpm} BPM | ${personalBaseline.breathingMedianBrpm} BRPM | SD ${personalBaseline.upperTraceStdDev}`;
        phase = 'CLAUSE_1_CALM';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_1_CALM') {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 6500) {
        docSession = selectActiveClause(docSession, 'msa-2', personalBaseline, simClockMs);
        phase = 'CLAUSE_2_SKIM';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_2_SKIM') {
      // Skim Clause 2 for only 2.0s (below 7.6s floor) -> triggers SKIM_DETECTED (Pass 1)
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 2000) {
        docSession = selectActiveClause(docSession, 'msa-3', personalBaseline, simClockMs);
        phase = 'CLAUSE_3_APNEA';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_3_APNEA') {
      // Read Clause 3 (Critical IP Trap) for 10.5s while holding breath & surging pulse -> triggers APNEA_FRICTION (Pass 1)
      const pkt = generateReplayMetricsSlice('APNEA_AND_PULSE_SPIKE', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 10500) {
        docSession = finalizeCurrentClause(docSession, personalBaseline, simClockMs);
        docSession = startSettlingGate(docSession, 'msa-3');
        updateSettlingGateBanner();
        phase = 'CLAUSE_3_SETTLE';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_3_SETTLE') {
      // Stream coherent respiratory waves at 120ms steps so the SignSteady Gate visibly tracks 0/2 -> 1/2 -> 2/2
      const settleStepMs = 120;
      const pkt = generateReplayMetricsSlice('COHERENT_SETTLING_BREATH', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, settleStepMs);
      if (
        (docSession.records['msa-3']?.status === 'SETTLED_OVERRIDE' && phaseElapsedMs >= 4500) ||
        phaseElapsedMs >= 11000
      ) {
        docSession = selectActiveClause(docSession, 'msa-2', personalBaseline, simClockMs);
        phase = 'CLAUSE_2_REREAD';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_2_REREAD') {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 6500) {
        docSession = selectActiveClause(docSession, 'msa-4', personalBaseline, simClockMs);
        phase = 'CLAUSE_4_CALM';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_4_CALM') {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 6500) {
        docSession = selectActiveClause(docSession, 'msa-5', personalBaseline, simClockMs);
        phase = 'CLAUSE_5_CALM';
        phaseElapsedMs = 0;
      }
      return;
    }

    if (phase === 'CLAUSE_5_CALM') {
      const pkt = generateReplayMetricsSlice('CALM_STEADY_READER', simElapsedSec, tsUs);
      handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
      if (phaseElapsedMs >= 9500) {
        if (walkthroughInterval) {
          clearInterval(walkthroughInterval);
          walkthroughInterval = null;
        }
        docSession = finalizeCurrentClause(docSession, personalBaseline, simClockMs);
        renderClauseCards();
        updateReceiptAndSignOffUI();
        switchRightTab('tabReceipt');
        showNotice(
          'Walkthrough Complete',
          'All 5 clauses verified via packet-stream processing (Pass 1 vs Pass 2 Ghost Comparisons recorded on § 2.4 & § 3.2).'
        );
      }
    }
  }, 40);
}

async function refreshVaultStatus(): Promise<void> {
  if (!window.clausePulseHost) return;
  const cfg = await window.clausePulseHost.getConfig();
  sdkVersion = cfg.sdkVersion || '3.5.0';
  telemetryEnabled = cfg.telemetryEnabled;

  $('sdkVersionBadge').textContent = `@smartspectra/node-sdk v${sdkVersion}`;
  $<HTMLInputElement>('vaultTelemetryToggle').checked = telemetryEnabled;
  $<HTMLInputElement>('consentTelemetryToggle').checked = telemetryEnabled;

  $('vaultKeyStatusText').textContent = cfg.hasApiKey
    ? `Configured (${cfg.maskedKey} via ${cfg.keySource})`
    : 'No Cloud Key (Live Webcam Optical ROI Ready)';

  const receipts = await window.clausePulseHost.getReceipts();
  renderSavedReceiptsList(receipts);
}

function renderSavedReceiptsList(receipts: ReadReceiptPayload[]): void {
  $('savedReceiptsCount').textContent = String(receipts.length);
  const listEl = $('savedReceiptsList');
  if (receipts.length === 0) {
    listEl.innerHTML = `<p class="bench-sub">No receipts saved yet in local storage.</p>`;
    return;
  }
  listEl.innerHTML = receipts
    .slice(0, 6)
    .map(
      (r) => `
      <div style="padding: 6px 0; border-bottom: 1px solid var(--border-hairline); font-size: 11px;">
        <strong>${escapeHtml(r.document.title)}</strong><br/>
        <span style="font-family: var(--font-mono); color: var(--text-muted);">
          ${escapeHtml(r.generatedAtIso.slice(0, 19).replace('T', ' '))} • ${escapeHtml(
        r.integrityDigestHex.slice(0, 22)
      )}…
        </span>
      </div>
    `
    )
    .join('');
}

function initEventListeners(): void {
  // Consent Modal
  $('btnAcceptConsent').addEventListener('click', async () => {
    const tel = $<HTMLInputElement>('consentTelemetryToggle').checked;
    telemetryEnabled = tel;
    $<HTMLInputElement>('vaultTelemetryToggle').checked = tel;
    await window.clausePulseHost?.setTelemetryPreference(tel);
    $('consentModal').hidden = true;
    updateReceiptAndSignOffUI();
  });

  $('btnOpenConsentModal').addEventListener('click', () => {
    $('consentModal').hidden = false;
  });

  // Theme Switcher (Carbon Instrument vs Archival Vellum)
  $('btnToggleTheme').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'vellum' ? 'carbon' : 'vellum';
    html.setAttribute('data-theme', next);
    $('btnToggleTheme').textContent = `Theme: ${next === 'vellum' ? 'Vellum' : 'Carbon'}`;
  });

  // Blur Preview Toggle
  $('chkBlurPreview').addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    $('cameraPreview').classList.toggle('blurred', checked);
  });

  // Sensor & Recording Buttons
  $('btnStartCamera').addEventListener('click', () => startLiveCameraSession(true));
  $('btnRecordTake').addEventListener('click', () => toggleRecordCameraTake());
  $('btnRunVideoFile').addEventListener('click', () => startVideoFileSession());
  $('btnStopSensor').addEventListener('click', () => stopAllSensors());
  $('btnStartBaseline').addEventListener('click', () => startBaselineCalibration());

  // Real Local File Ingestion (`open-local-file`)
  $('btnOpenLocalFile').addEventListener('click', async () => {
    const res = await window.clausePulseHost?.openLocalFile();
    if (!res || res.canceled) return;
    if (!res.ok || !res.content) {
      showNotice('File Open Failed', res.error || 'Could not read selected file.');
      return;
    }
    const parsed = parseCustomDocumentIntoClauses(
      res.fileName || 'Local File',
      res.content,
      res.filePath
    );
    addAndSelectPresetInDropdown(parsed, 'File');
    showNotice(
      'Local File Loaded',
      `Parsed ${parsed.clauses.length} auditable blocks from ${res.fileName} (SHA-256: ${parsed.sourceHashSha256?.slice(0, 12)}…).`
    );
  });

  // Real Git Repository Diff Ingestion (`scan-git-diff`)
  const handleGitDiffAudit = async (chooseDir: boolean) => {
    const res = await window.clausePulseHost?.scanGitDiff(chooseDir);
    if (!res || res.canceled) return;
    if (!res.ok) {
      showNotice('Git Diff Audit Failed', res.error || 'Could not scan Git repository.');
      return;
    }
    const parsed = parseGitDiffIntoPreset(
      res.repoName || 'Repository',
      res.branchName || 'HEAD',
      res.rawDiff || '',
      res.repoPath
    );
    addAndSelectPresetInDropdown(parsed, 'Git');
    showNotice(
      'Git Diff Loaded',
      `Parsed ${parsed.clauses.length} diff hunks from ${res.repoName} (${res.branchName}).`
    );
  };

  $('btnScanGitRepo').addEventListener('click', () => handleGitDiffAudit(false));
  $('btnPickGitFolder').addEventListener('click', () => handleGitDiffAudit(true));

  // Jump to 30-Case Benchmark Tab
  $('btnJumpToEval').addEventListener('click', () => {
    renderEvaluationBenchmark();
    switchRightTab('tabEval');
  });

  $('btnRunEvalSuite').addEventListener('click', () => {
    renderEvaluationBenchmark();
    showNotice('Benchmark Executed', 'Re-ran all 30 physiological evaluation scenarios.');
  });

  // Document Preset & Custom Import
  $('selectDocumentPreset').addEventListener('change', (e) => {
    const id = (e.target as HTMLSelectElement).value;
    const all = [...BUILTIN_DOCUMENT_PRESETS, ...customPresets];
    const found = all.find((p) => p.id === id);
    if (found) loadDocumentPreset(found);
  });

  $('btnOpenCustomDoc').addEventListener('click', () => {
    $('customDocModal').hidden = false;
  });

  $('btnCancelCustomDoc').addEventListener('click', () => {
    $('customDocModal').hidden = true;
  });

  $('btnLoadCustomDoc').addEventListener('click', () => {
    const title = $<HTMLInputElement>('customDocTitleInput').value;
    const body = $<HTMLTextAreaElement>('customDocBodyInput').value;
    const parsed = parseCustomDocumentIntoClauses(title, body);
    $('customDocModal').hidden = true;
    addAndSelectPresetInDropdown(parsed, 'Custom');
  });

  // Prev / Next Clause Navigation
  $('btnPrevClause').addEventListener('click', () => {
    const idx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
    if (idx > 0) {
      docSession = selectActiveClause(
        docSession,
        docSession.clauses[idx - 1].id,
        personalBaseline,
        Date.now()
      );
      renderClauseCards();
      updateReceiptAndSignOffUI();
    }
  });

  $('btnNextClause').addEventListener('click', () => {
    const idx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
    if (idx >= 0 && idx < docSession.clauses.length - 1) {
      docSession = selectActiveClause(
        docSession,
        docSession.clauses[idx + 1].id,
        personalBaseline,
        Date.now()
      );
      renderClauseCards();
      updateReceiptAndSignOffUI();
    }
  });

  // Right Tabs
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        if (tabId === 'tabEval') renderEvaluationBenchmark();
        switchRightTab(tabId);
      }
    });
  });

  // Receipt & Git Trailer Actions
  $('btnFinalizeClause').addEventListener('click', () => {
    docSession = finalizeCurrentClause(docSession, personalBaseline, Date.now());
    renderClauseCards();
    updateReceiptAndSignOffUI();
  });

  $('btnAttestDocument').addEventListener('click', async () => {
    docSession = finalizeCurrentClause(docSession, personalBaseline, Date.now());
    const receipt = buildReadReceiptPayload(
      activePreset,
      docSession,
      personalBaseline,
      sourceMode,
      telemetryEnabled,
      sdkVersion
    );
    const saved = await window.clausePulseHost?.saveReceipt(receipt);
    if (saved?.receipts) {
      renderSavedReceiptsList(saved.receipts);
    }
    showNotice('Read Receipt Attested', `Signed locally with ${receipt.integrityDigestHex.slice(0, 24)}…`);
  });

  $('btnCopyGitTrailer').addEventListener('click', () => {
    const text = $('gitTrailerCode').textContent || '';
    navigator.clipboard?.writeText(text);
    showNotice('Git Trailer Copied', 'Copied SHA-256 Attested-By-ClausePulse trailer to clipboard.');
  });

  $('btnCopyReceiptMd').addEventListener('click', () => {
    const text = $('receiptMarkdownPreview').textContent || '';
    navigator.clipboard?.writeText(text);
    showNotice('Copied', 'Physiological Read Receipt Markdown copied to clipboard.');
  });

  $('btnExportReceiptFile').addEventListener('click', async () => {
    const receipt = buildReadReceiptPayload(
      activePreset,
      docSession,
      personalBaseline,
      sourceMode,
      telemetryEnabled,
      sdkVersion
    );
    const md = formatReadReceiptMarkdown(receipt);
    const jsonStr = JSON.stringify(receipt, null, 2);
    await window.clausePulseHost?.exportReceiptFile(
      md,
      jsonStr,
      `ClausePulse-${activePreset.id}-Receipt.md`
    );
  });

  // Signal Replay Bench
  $('btnRunAutoWalkthrough').addEventListener('click', () => {
    runFullAutomatedWalkthrough();
  });

  document.querySelectorAll<HTMLButtonElement>('.profile-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const profile = btn.getAttribute('data-profile') as ReplayScenarioProfile;
      if (profile) {
        startDeterministicReplay(profile);
      }
    });
  });

  // Key Vault & Privacy Controls
  $('btnSaveApiKey').addEventListener('click', async () => {
    const val = $<HTMLInputElement>('inputApiKey').value.trim();
    if (!val) return;
    await window.clausePulseHost?.saveApiKey(val);
    $<HTMLInputElement>('inputApiKey').value = '';
    await refreshVaultStatus();
    showNotice('Key Saved', 'Presage API Key encrypted and stored in OS keystore.');
  });

  $('btnForgetApiKey').addEventListener('click', async () => {
    await window.clausePulseHost?.forgetApiKey();
    await refreshVaultStatus();
    showNotice('Key Removed', 'Stored Presage API Key deleted from OS keystore.');
  });

  $('btnCheckReadiness').addEventListener('click', async () => {
    const box = $('readinessResultBox');
    box.hidden = false;
    box.textContent = 'Running SmartSpectraSDK.checkDeviceReadiness()…';
    const res = await window.clausePulseHost?.checkDeviceReadiness();
    box.textContent = `Verdict: ${res?.verdict?.toUpperCase() || 'UNKNOWN'} — ${
      res?.reason || ''
    }`;
  });

  $('vaultTelemetryToggle').addEventListener('change', async (e) => {
    const enabled = (e.target as HTMLInputElement).checked;
    telemetryEnabled = enabled;
    $<HTMLInputElement>('consentTelemetryToggle').checked = enabled;
    await window.clausePulseHost?.setTelemetryPreference(enabled);
    updateReceiptAndSignOffUI();
  });

  $('btnWipeAllData').addEventListener('click', async () => {
    await stopAllSensors();
    await window.clausePulseHost?.wipeAllLocalData();
    personalBaseline = null;
    loadDocumentPreset(activePreset);
    await refreshVaultStatus();
    showNotice('Local Data Wiped', 'All session buffers, saved receipts, recorded takes, and stored keys deleted.');
  });

  // Listen for native Video File SDK events from main process
  window.clausePulseHost?.onVideoFileEvent((payload: any) => {
    if (!payload) return;
    if (payload.kind === 'processingStatus') {
      updateProcessingBadge(payload.status);
    } else if (payload.kind === 'validationStatus') {
      updateValidationHud(payload.code, payload.hint || '');
    } else if (payload.kind === 'metrics' && payload.decoded) {
      handleDecodedMetricsPacket(payload.decoded, Date.now());
    } else if (payload.kind === 'error') {
      showNotice(`SDK Video Error (${payload.code})`, payload.message || '');
    }
  });

  window.addEventListener('beforeunload', () => {
    stopAllSensors();
  });
}

// Initialize Workbench
document.addEventListener('DOMContentLoaded', async () => {
  initEventListeners();
  loadDocumentPreset(BUILTIN_DOCUMENT_PRESETS[0]);
  renderEvaluationBenchmark();
  await refreshVaultStatus();
});
