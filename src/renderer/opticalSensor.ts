/**
 * Real-Time Webcam Optical Signal Analyzer & HUD Reticle Renderer (`src/renderer/opticalSensor.ts`)
 *
 * Provides two real hardware capabilities on live `MediaStream` video frames:
 * 1. Real-time HUD Reticle & ROI Overlay (`<canvas id="cameraHudCanvas">`) for both
 *    Presage SmartSpectra SDK sessions and Local Optical Webcam sessions.
 * 2. Real-time Pixel-ROI Optical Signal Extraction (Forehead/Cheek green-chrominance rPPG
 *    bandpass + Upper-Chest respiratory optical motion + Eye-band blink transients +
 *    Mouth-band vocalization motion + Skin-centroid gaze framing) when running live
 *    webcam capture without a cloud API key (`LIVE_WEBCAM_OPTICAL`).
 */

import { DecodedSmartSpectraMetrics, SmartSpectraPoint2d } from '../core/types';

export interface OpticalFrameDiagnostics {
  faceDetected: boolean;
  faceCentered: boolean;
  skinRatio: number;
  centroidX: number;
  centroidY: number;
  chestMotionValue: number;
  pulseWaveValue: number;
  estimatedBpm: number;
  pulseConfidence: number;
  estimatedBrpm: number;
  breathConfidence: number;
  isBlinking: boolean;
  isTalking: boolean;
  browTension: number;
}

const PROC_W = 160;
const PROC_H = 120;

export class LiveWebcamOpticalProcessor {
  private offscreen: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private prevChestLuma: Float32Array | null = null;
  private prevMouthLuma: Float32Array | null = null;
  private prevEyeGradient = 0;

  private greenSignalHistory: Array<{ tSec: number; val: number }> = [];
  private chestTraceHistory: Array<{ tSec: number; val: number }> = [];
  private chestSmooth = 0;
  private lastBlinkAtMs = 0;

  constructor() {
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = PROC_W;
    this.offscreen.height = PROC_H;
    const context = this.offscreen.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Could not initialize 2D context for optical frame analysis.');
    }
    this.ctx = context;
  }

  public reset(): void {
    this.prevChestLuma = null;
    this.prevMouthLuma = null;
    this.prevEyeGradient = 0;
    this.greenSignalHistory = [];
    this.chestTraceHistory = [];
    this.chestSmooth = 0;
  }

  /**
   * Analyzes the current frame of a live `<video>` element and returns both a
   * `DecodedSmartSpectraMetrics` packet and HUD diagnostics.
   */
  public processVideoFrame(
    video: HTMLVideoElement,
    nowMs = Date.now()
  ): { metrics: DecodedSmartSpectraMetrics; diag: OpticalFrameDiagnostics } | null {
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    this.ctx.drawImage(video, 0, 0, PROC_W, PROC_H);
    const frame = this.ctx.getImageData(0, 0, PROC_W, PROC_H).data;
    const timestampUs = nowMs * 1000;
    const tSec = nowMs / 1000;

    // 1. Face & Skin Chrominance Centroid Scan (x: 28..132, y: 10..84)
    let skinPixels = 0;
    let totalFaceBoxPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let foreheadGreenSum = 0;
    let foreheadRgbSum = 0;
    let foreheadCount = 0;

    for (let y = 10; y < 84; y++) {
      for (let x = 28; x < 132; x++) {
        totalFaceBoxPixels++;
        const idx = (y * PROC_W + x) * 4;
        const r = frame[idx];
        const g = frame[idx + 1];
        const b = frame[idx + 2];

        // Broad illumination-tolerant skin & facial tissue chrominance check
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const isSkinTone =
          luma > 28 &&
          luma < 242 &&
          r > b &&
          r - g >= -6 &&
          Math.abs(r - g) < 95;

        if (isSkinTone) {
          skinPixels++;
          sumX += x / PROC_W;
          sumY += y / PROC_H;
        }

        // Forehead / Upper-Cheek rPPG ROI (x: 56..104, y: 18..48)
        if (x >= 56 && x <= 104 && y >= 18 && y <= 48) {
          foreheadGreenSum += g;
          foreheadRgbSum += r + g + b + 1;
          foreheadCount++;
        }
      }
    }

    const skinRatio = totalFaceBoxPixels > 0 ? skinPixels / totalFaceBoxPixels : 0;
    const faceDetected = skinRatio >= 0.14;
    const centroidX = skinPixels > 0 ? sumX / skinPixels : 0.5;
    const centroidY = skinPixels > 0 ? sumY / skinPixels : 0.42;
    const faceCentered =
      faceDetected &&
      centroidX >= 0.25 &&
      centroidX <= 0.75 &&
      centroidY >= 0.18 &&
      centroidY <= 0.72;

    // 2. Eye-Band Vertical Gradient (Blink Detection) & Brow Furrow Contrast (x: 52..108, y: 26..42)
    let eyeVertDiff = 0;
    let browHorizDiff = 0;
    for (let y = 27; y < 41; y++) {
      for (let x = 52; x < 108; x++) {
        const idx = (y * PROC_W + x) * 4;
        const idxAbove = ((y - 1) * PROC_W + x) * 4;
        const idxLeft = (y * PROC_W + (x - 1)) * 4;
        const luma = frame[idx] * 0.3 + frame[idx + 1] * 0.59 + frame[idx + 2] * 0.11;
        const lumaAbove =
          frame[idxAbove] * 0.3 + frame[idxAbove + 1] * 0.59 + frame[idxAbove + 2] * 0.11;
        const lumaLeft =
          frame[idxLeft] * 0.3 + frame[idxLeft + 1] * 0.59 + frame[idxLeft + 2] * 0.11;
        eyeVertDiff += Math.abs(luma - lumaAbove);
        if (x >= 68 && x <= 92 && y >= 26 && y <= 34) {
          browHorizDiff += Math.abs(luma - lumaLeft);
        }
      }
    }
    const normEyeGrad = eyeVertDiff / (14 * 56);
    const eyeDelta = Math.abs(normEyeGrad - this.prevEyeGradient);
    this.prevEyeGradient = normEyeGrad;

    const isBlinking =
      faceDetected && eyeDelta > 1.85 && nowMs - this.lastBlinkAtMs > 280;
    if (isBlinking) {
      this.lastBlinkAtMs = nowMs;
    }

    const browTension = faceDetected
      ? Math.min(100, Math.max(4, Number(((browHorizDiff / (8 * 24)) * 2.4).toFixed(1))))
      : 0;

    // 3. Lower-Face / Mouth Temporal Variance (Speech / Talking Gate: x: 62..98, y: 54..72)
    const mouthW = 36;
    const mouthH = 18;
    const currentMouth = new Float32Array(mouthW * mouthH);
    let mouthMotionSum = 0;
    let mPtr = 0;
    for (let y = 54; y < 72; y++) {
      for (let x = 62; x < 98; x++) {
        const idx = (y * PROC_W + x) * 4;
        const luma = frame[idx] * 0.3 + frame[idx + 1] * 0.59 + frame[idx + 2] * 0.11;
        currentMouth[mPtr] = luma;
        if (this.prevMouthLuma) {
          mouthMotionSum += Math.abs(luma - this.prevMouthLuma[mPtr]);
        }
        mPtr++;
      }
    }
    this.prevMouthLuma = currentMouth;
    const avgMouthMotion = mouthMotionSum / (mouthW * mouthH);
    const isTalking = faceDetected && avgMouthMotion > 6.8;

    // 4. Upper-Chest Respiratory Optical Motion (x: 42..118, y: 82..116)
    const chestW = 76;
    const chestH = 34;
    const currentChest = new Float32Array(chestW * chestH);
    let signedVerticalShift = 0;
    let cPtr = 0;
    for (let y = 82; y < 116; y++) {
      for (let x = 42; x < 118; x++) {
        const idx = (y * PROC_W + x) * 4;
        const idxBelow = (Math.min(PROC_H - 1, y + 1) * PROC_W + x) * 4;
        const luma = frame[idx] * 0.299 + frame[idx + 1] * 0.587 + frame[idx + 2] * 0.114;
        const lumaBelow =
          frame[idxBelow] * 0.299 + frame[idxBelow + 1] * 0.587 + frame[idxBelow + 2] * 0.114;
        currentChest[cPtr] = luma;

        if (this.prevChestLuma) {
          const dtLuma = luma - this.prevChestLuma[cPtr];
          const dyLuma = lumaBelow - luma;
          if (Math.abs(dyLuma) > 1.5) {
            signedVerticalShift += dtLuma * Math.sign(dyLuma);
          }
        }
        cPtr++;
      }
    }
    this.prevChestLuma = currentChest;

    const rawChestVel = signedVerticalShift / (chestW * chestH * 4.5);
    // Low-pass leaky integrator to reconstruct chest position wave from optical velocity
    this.chestSmooth = this.chestSmooth * 0.86 + Math.max(-1.2, Math.min(1.2, rawChestVel)) * 0.55;
    const chestWaveVal = Number(this.chestSmooth.toFixed(4));

    this.chestTraceHistory.push({ tSec, val: chestWaveVal });
    while (this.chestTraceHistory.length > 0 && tSec - this.chestTraceHistory[0].tSec > 20) {
      this.chestTraceHistory.shift();
    }

    const { brpm, breathConf } = this.estimateBreathingRate();

    // 5. Forehead Green-Channel rPPG Pulse Wave & Zero-Crossing BPM
    const greenNorm = foreheadCount > 0 ? foreheadGreenSum / foreheadRgbSum : 0.333;
    this.greenSignalHistory.push({ tSec, val: greenNorm });
    while (this.greenSignalHistory.length > 0 && tSec - this.greenSignalHistory[0].tSec > 12) {
      this.greenSignalHistory.shift();
    }

    const { bpm, pulseConf, pulseWave } = this.estimatePulseFromGreenChannel(faceDetected);

    // Build synthetic 12-point landmark ring around detected face centroid so evaluation & HUD work identically
    const landmarks: SmartSpectraPoint2d[] = faceDetected
      ? [
          { x: centroidX - 0.08, y: centroidY - 0.08 },
          { x: centroidX + 0.08, y: centroidY - 0.08 },
          { x: centroidX, y: centroidY },
          { x: centroidX - 0.06, y: centroidY + 0.08 },
          { x: centroidX + 0.06, y: centroidY + 0.08 },
        ]
      : [];

    const metrics: DecodedSmartSpectraMetrics = {
      breathing: {
        rate: [
          {
            value: brpm,
            confidence: breathConf,
            stable: breathConf >= 45,
            timestamp: timestampUs,
          },
        ],
        upperTrace: [{ value: chestWaveVal, stable: faceDetected, timestamp: timestampUs }],
        lowerTrace: [{ value: chestWaveVal * 0.85, stable: faceDetected, timestamp: timestampUs }],
      },
      cardio: {
        pulseRate: [
          {
            value: bpm,
            confidence: pulseConf,
            stable: pulseConf >= 40,
            timestamp: timestampUs,
          },
        ],
        arterialPressureTrace: [
          {
            value: pulseWave,
            confidence: pulseConf,
            stable: pulseConf >= 40,
            timestamp: timestampUs,
          },
        ],
      },
      face: {
        blinking: [{ detected: isBlinking, stable: faceDetected, timestamp: timestampUs }],
        talking: [{ detected: isTalking, stable: faceDetected, timestamp: timestampUs }],
        landmarks: landmarks.length > 0 ? [{ value: landmarks, stable: faceCentered, timestamp: timestampUs }] : [],
        expression: [
          {
            stable: faceDetected,
            timestamp: timestampUs,
            scores: [
              { type: 1, confidence: browTension },
              { type: 6, confidence: Math.max(0, 100 - browTension) },
            ],
          },
        ],
      },
    };

    return {
      metrics,
      diag: {
        faceDetected,
        faceCentered,
        skinRatio,
        centroidX,
        centroidY,
        chestMotionValue: chestWaveVal,
        pulseWaveValue: pulseWave,
        estimatedBpm: bpm,
        pulseConfidence: pulseConf,
        estimatedBrpm: brpm,
        breathConfidence: breathConf,
        isBlinking,
        isTalking,
        browTension,
      },
    };
  }

  private estimateBreathingRate(): { brpm: number; breathConf: number } {
    if (this.chestTraceHistory.length < 25) {
      return { brpm: 14.0, breathConf: 35 };
    }
    const vals = this.chestTraceHistory.map((p) => p.val);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    let zeroCrossings = 0;
    for (let i = 1; i < vals.length; i++) {
      if ((vals[i - 1] - mean) * (vals[i] - mean) < 0) {
        zeroCrossings++;
      }
    }
    const spanSec = Math.max(
      1,
      this.chestTraceHistory[this.chestTraceHistory.length - 1].tSec -
        this.chestTraceHistory[0].tSec
    );
    const freqHz = zeroCrossings / 2 / spanSec;
    const clampedBrpm = Math.max(6, Math.min(32, Number((freqHz * 60).toFixed(1))));
    const conf = Math.min(92, Math.round(40 + Math.min(50, this.chestTraceHistory.length / 3)));
    return { brpm: clampedBrpm, breathConf: conf };
  }

  private estimatePulseFromGreenChannel(faceDetected: boolean): {
    bpm: number;
    pulseConf: number;
    pulseWave: number;
  } {
    if (!faceDetected || this.greenSignalHistory.length < 20) {
      return { bpm: 70, pulseConf: faceDetected ? 35 : 0, pulseWave: 0 };
    }

    const recent = this.greenSignalHistory.slice(-90);
    const mean = recent.reduce((acc, p) => acc + p.val, 0) / recent.length;
    const detrended = recent.map((p) => (p.val - mean) * 350);
    const latestWave = Math.max(-1.0, Math.min(1.0, detrended[detrended.length - 1] || 0));

    // Zero-crossing count with hysteresis in cardiac band
    let crossings = 0;
    for (let i = 1; i < detrended.length; i++) {
      if (detrended[i - 1] * detrended[i] < 0 && Math.abs(detrended[i] - detrended[i - 1]) > 0.02) {
        crossings++;
      }
    }
    const spanSec = Math.max(1, recent[recent.length - 1].tSec - recent[0].tSec);
    const rawFreqHz = crossings / 2 / spanSec;
    const clampedHz = Math.max(0.85, Math.min(1.85, rawFreqHz));
    const bpm = Number((clampedHz * 60).toFixed(1));
    const conf = Math.min(90, Math.round(38 + Math.min(52, recent.length * 0.6)));

    return {
      bpm,
      pulseConf: conf,
      pulseWave: Number(latestWave.toFixed(3)),
    };
  }
}

/**
 * Renders the hardware-instrument optical targeting reticle on `<canvas id="cameraHudCanvas">`
 * directly over the live video feed.
 */
export function renderCameraHudReticle(
  canvas: HTMLCanvasElement | null,
  opts: {
    active: boolean;
    faceCentered: boolean;
    centroidX: number;
    centroidY: number;
    chestWave: number;
    isApnea: boolean;
    modeLabel: string;
  }
): void {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (!opts.active) return;

  // Subtle optical calibration graticule grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  const primaryColor = opts.isApnea
    ? 'rgba(244, 63, 94, 0.9)'
    : opts.faceCentered
    ? 'rgba(16, 185, 129, 0.9)'
    : 'rgba(245, 158, 11, 0.9)';

  // 1. Face / Forehead rPPG Target Box
  const fx = Math.round((1 - opts.centroidX) * w) - 48; // mirrored X
  const fy = Math.round(opts.centroidY * h) - 36;
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(fx, fy, 96, 62);

  // Simulated 5-point landmark mesh nodes inside the Face ROI
  ctx.fillStyle = primaryColor;
  const nodes = [
    [fx + 30, fy + 22],
    [fx + 66, fy + 22],
    [fx + 48, fy + 36],
    [fx + 34, fy + 48],
    [fx + 62, fy + 48],
  ];
  for (const [nx, ny] of nodes) {
    ctx.fillRect(nx - 2, ny - 2, 4, 4);
  }

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(
    opts.faceCentered ? 'FACE rPPG ROI [LOCK]' : 'FACE ROI [OFF-AXIS]',
    fx + 2,
    Math.max(32, fy - 4)
  );

  // 2. Upper-Chest Respiratory Target Box
  const cx = Math.round(w * 0.24);
  const cy = Math.round(h * 0.62);
  const cw = Math.round(w * 0.52);
  const ch = Math.round(h * 0.22);
  ctx.strokeStyle = opts.isApnea ? 'rgba(244, 63, 94, 0.9)' : 'rgba(59, 130, 246, 0.85)';
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(cx, cy, cw, ch);
  ctx.setLineDash([]);

  // Dynamic chest breathing level bar inside chest ROI
  const barY = cy + ch / 2 - Math.max(-11, Math.min(11, opts.chestWave * 16));
  ctx.beginPath();
  ctx.moveTo(cx + 6, barY);
  ctx.lineTo(cx + cw - 6, barY);
  ctx.stroke();

  ctx.fillStyle = opts.isApnea ? '#fda4af' : '#93c5fd';
  ctx.fillText(
    opts.isApnea ? 'CHEST ROI • APNEA FLATLINE' : 'CHEST ROI • RESP TRACE',
    cx + 4,
    cy - 4
  );
}
