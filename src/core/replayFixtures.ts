/**
 * Deterministic Biometric Replay Fixtures (Explicitly Labeled Test Bench Mode)
 *
 * Generates protobuf-shaped `DecodedSmartSpectraMetrics` packets for automated testing
 * and headless judge inspection when a physical camera or live API key is not active.
 * Never presented as live camera input; always labeled `DETERMINISTIC_REPLAY_BENCH`.
 */

import { DecodedSmartSpectraMetrics } from './types';

export type ReplayScenarioProfile =
  | 'CALM_STEADY_READER'
  | 'APNEA_AND_PULSE_SPIKE'
  | 'OFF_SCREEN_SKIMMER'
  | 'TALKING_ALOUD_PAUSE'
  | 'COHERENT_SETTLING_BREATH';

/**
 * Generates a realistic 100ms time-slice of `DecodedSmartSpectraMetrics` for the given scenario.
 */
export function generateReplayMetricsSlice(
  profile: ReplayScenarioProfile,
  elapsedSec: number,
  timestampUs = Date.now() * 1000
): DecodedSmartSpectraMetrics {
  const centeredLandmarks = [
    { x: 0.42, y: 0.38 },
    { x: 0.58, y: 0.38 },
    { x: 0.5, y: 0.48 },
    { x: 0.45, y: 0.58 },
    { x: 0.55, y: 0.58 },
  ];

  const offScreenLandmarks = [
    { x: 0.04, y: 0.05 },
    { x: 0.08, y: 0.06 },
  ];

  if (profile === 'APNEA_AND_PULSE_SPIKE') {
    // Breath-hold flatline on upperTrace (value ~ 0.01 with tiny noise) + elevated pulse (84 BPM) + brow furrow
    const flatBreath = Math.sin(elapsedSec * 0.4) * 0.012;
    const pulseWave = Math.sin(elapsedSec * 2 * Math.PI * 1.4) * 0.85;
    return {
      breathing: {
        rate: [{ value: 9.2, confidence: 78, stable: true, timestamp: timestampUs }],
        upperTrace: [{ value: flatBreath, stable: true, timestamp: timestampUs }],
        lowerTrace: [{ value: flatBreath * 0.8, stable: true, timestamp: timestampUs }],
      },
      cardio: {
        pulseRate: [{ value: 83.5, confidence: 88, stable: true, timestamp: timestampUs }],
        arterialPressureTrace: [
          { value: pulseWave, confidence: 86, stable: true, timestamp: timestampUs },
        ],
        hrv: [
          {
            rmssd: 24.5,
            sdnn: 31.0,
            meanNn: 718,
            baevsky: 215.0,
            confidence: 76,
            stable: true,
            timestamp: timestampUs,
          },
        ],
      },
      face: {
        blinking: [{ detected: false, stable: true, timestamp: timestampUs }],
        talking: [{ detected: false, stable: true, timestamp: timestampUs }],
        landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
        expression: [
          {
            stable: true,
            timestamp: timestampUs,
            scores: [
              { type: 1, confidence: 34.0 }, // ANGRY / brow furrow
              { type: 4, confidence: 12.0 }, // FEAR / tension
              { type: 6, confidence: 54.0 }, // NEUTRAL
            ],
          },
        ],
      },
      eda: {
        trace: [{ value: 1.48, stable: true, timestamp: timestampUs }],
      },
    };
  }

  if (profile === 'OFF_SCREEN_SKIMMER') {
    const normalBreath = Math.sin(elapsedSec * 2 * Math.PI * 0.23) * 0.45;
    return {
      breathing: {
        rate: [{ value: 14.0, confidence: 72, stable: true, timestamp: timestampUs }],
        upperTrace: [{ value: normalBreath, stable: true, timestamp: timestampUs }],
        lowerTrace: [{ value: normalBreath * 0.9, stable: true, timestamp: timestampUs }],
      },
      cardio: {
        pulseRate: [{ value: 71.0, confidence: 82, stable: true, timestamp: timestampUs }],
        arterialPressureTrace: [
          {
            value: Math.sin(elapsedSec * 2 * Math.PI * 1.18) * 0.6,
            confidence: 80,
            stable: true,
            timestamp: timestampUs,
          },
        ],
      },
      face: {
        blinking: [{ detected: false, stable: true, timestamp: timestampUs }],
        talking: [{ detected: false, stable: true, timestamp: timestampUs }],
        landmarks: [{ value: offScreenLandmarks, stable: false, timestamp: timestampUs }],
        expression: [
          {
            stable: true,
            timestamp: timestampUs,
            scores: [{ type: 6, confidence: 92.0 }],
          },
        ],
      },
    };
  }

  if (profile === 'TALKING_ALOUD_PAUSE') {
    const noisyTrace = Math.sin(elapsedSec * 9.0) * 0.65;
    return {
      breathing: {
        rate: [{ value: 18.0, confidence: 25, stable: false, timestamp: timestampUs }],
        upperTrace: [{ value: noisyTrace, stable: false, timestamp: timestampUs }],
      },
      cardio: {
        pulseRate: [{ value: 75.0, confidence: 65, stable: true, timestamp: timestampUs }],
      },
      face: {
        blinking: [
          { detected: Math.floor(elapsedSec * 10) % 28 === 0, stable: true, timestamp: timestampUs },
        ],
        talking: [{ detected: true, stable: true, timestamp: timestampUs }],
        landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
      },
    };
  }

  if (profile === 'COHERENT_SETTLING_BREATH') {
    // Deep, slow 6-breaths/min (0.12 Hz = ~8.3s period, or 0.25 Hz for 4s cycles) coherent wave
    const deepWave = Math.sin(elapsedSec * 2 * Math.PI * 0.28) * 0.68;
    const pulseWave = Math.sin(elapsedSec * 2 * Math.PI * 1.12) * 0.55;
    return {
      breathing: {
        rate: [{ value: 10.5, confidence: 92, stable: true, timestamp: timestampUs }],
        upperTrace: [{ value: deepWave, stable: true, timestamp: timestampUs }],
        lowerTrace: [{ value: deepWave * 0.95, stable: true, timestamp: timestampUs }],
      },
      cardio: {
        pulseRate: [{ value: 68.5, confidence: 90, stable: true, timestamp: timestampUs }],
        arterialPressureTrace: [
          { value: pulseWave, confidence: 89, stable: true, timestamp: timestampUs },
        ],
        hrv: [
          {
            rmssd: 46.2,
            sdnn: 52.4,
            meanNn: 875,
            baevsky: 94.0,
            confidence: 88,
            stable: true,
            timestamp: timestampUs,
          },
        ],
      },
      face: {
        blinking: [
          { detected: Math.floor(elapsedSec * 10) % 35 === 0, stable: true, timestamp: timestampUs },
        ],
        talking: [{ detected: false, stable: true, timestamp: timestampUs }],
        landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
        expression: [
          {
            stable: true,
            timestamp: timestampUs,
            scores: [{ type: 6, confidence: 94.0 }],
          },
        ],
      },
      eda: {
        trace: [{ value: 0.82, stable: true, timestamp: timestampUs }],
      },
    };
  }

  // Default: CALM_STEADY_READER (14 breaths/min, 70 BPM, normal blinking every ~3.5s)
  const calmBreath = Math.sin(elapsedSec * 2 * Math.PI * 0.23) * 0.42;
  const calmPulse = Math.sin(elapsedSec * 2 * Math.PI * 1.16) * 0.52;
  const isBlinkMoment = Math.floor(elapsedSec * 10) % 35 === 0;

  return {
    breathing: {
      rate: [{ value: 13.8, confidence: 89, stable: true, timestamp: timestampUs }],
      upperTrace: [{ value: calmBreath, stable: true, timestamp: timestampUs }],
      lowerTrace: [{ value: calmBreath * 0.88, stable: true, timestamp: timestampUs }],
    },
    cardio: {
      pulseRate: [{ value: 70.2, confidence: 91, stable: true, timestamp: timestampUs }],
      arterialPressureTrace: [
        { value: calmPulse, confidence: 88, stable: true, timestamp: timestampUs },
      ],
      hrv: [
        {
          rmssd: 42.8,
          sdnn: 48.1,
          meanNn: 854,
          baevsky: 108.0,
          confidence: 84,
          stable: true,
          timestamp: timestampUs,
        },
      ],
    },
    face: {
      blinking: [{ detected: isBlinkMoment, stable: true, timestamp: timestampUs }],
      talking: [{ detected: false, stable: true, timestamp: timestampUs }],
      landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
      expression: [
        {
          stable: true,
          timestamp: timestampUs,
          scores: [
            { type: 6, confidence: 91.0 },
            { type: 1, confidence: 5.0 },
          ],
        },
      ],
    },
    eda: {
      trace: [{ value: 0.85, stable: true, timestamp: timestampUs }],
    },
  };
}
