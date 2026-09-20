import type { Landmark } from './types';
import { captureConfig } from '../config/captureConfig';

export interface StepResult {
  stepCount: number;
  stepTimestamps: number[];
  cadence: number;
}

export function detectSteps(frames: Landmark[][], timestamps: number[]): StepResult {
  if (frames.length === 0 || frames.length !== timestamps.length) {
    return { stepCount: 0, stepTimestamps: [], cadence: 0 };
  }

  // 1. Calculate raw relative ankle distances and leg lengths
  const rawDistances: number[] = [];
  const legLengths: number[] = [];
  const minVis = captureConfig.MIN_LANDMARK_VISIBILITY;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (!frame || frame.length < 33) {
      rawDistances.push(0);
      continue;
    }

    const leftHip = frame[23];
    const rightHip = frame[24];
    const leftAnkle = frame[27];
    const rightAnkle = frame[28];

    const hipsVis = leftHip.visibility > minVis && rightHip.visibility > minVis;
    const anklesVis = leftAnkle.visibility > minVis && rightAnkle.visibility > minVis;

    if (hipsVis && anklesVis) {
      // Use signed distance between ankles
      const d = leftAnkle.x - rightAnkle.x;
      rawDistances.push(d);

      // Calculate vertical leg length for dynamic scaling
      const hipMidY = (leftHip.y + rightHip.y) / 2;
      const ankleMidY = (leftAnkle.y + rightAnkle.y) / 2;
      legLengths.push(Math.abs(ankleMidY - hipMidY));
    } else {
      rawDistances.push(0); // If not visible, assume 0
    }
  }

  // Calculate median leg length
  let medianLegLength = 0;
  if (legLengths.length > 0) {
    const sorted = [...legLengths].sort((a, b) => a - b);
    medianLegLength = sorted[Math.floor(sorted.length / 2)];
  }

  // 2. Detrend the signal (subtract a slow moving average to remove stationary bias)
  const detrendWindowMs = captureConfig.STEP_DETECTION.DETREND_WINDOW_MS;
  const detrendedDistances: number[] = [];

  for (let i = 0; i < rawDistances.length; i++) {
    const currentTime = timestamps[i];
    let sum = 0;
    let count = 0;
    
    // Look back up to detrendWindowMs
    for (let j = i; j >= 0; j--) {
      if (currentTime - timestamps[j] > detrendWindowMs) {
        break;
      }
      sum += rawDistances[j];
      count++;
    }
    const baseline = sum / count;
    detrendedDistances.push(rawDistances[i] - baseline);
  }

  // 3. Smooth the detrended signal to remove high-frequency jitter
  const smoothWindowMs = captureConfig.STEP_DETECTION.MOVING_AVERAGE_WINDOW_MS;
  const smoothedDistances: number[] = [];
  
  for (let i = 0; i < detrendedDistances.length; i++) {
    const currentTime = timestamps[i];
    let sum = 0;
    let count = 0;
    
    // Look back up to smoothWindowMs
    for (let j = i; j >= 0; j--) {
      if (currentTime - timestamps[j] > smoothWindowMs) {
        break;
      }
      sum += detrendedDistances[j];
      count++;
    }
    smoothedDistances.push(sum / count);
  }

  // 4. Absolute value of the detrended & smoothed signal
  const absSmoothed = smoothedDistances.map(Math.abs);

  // 5. True Prominence Peak detection
  let stepCount = 0;
  const stepTimestamps: number[] = [];
  let lastStepTime = 0;
  const { MIN_TIME_BETWEEN_STEPS_MS, MIN_PEAK_PROMINENCE_FRACTION, MIN_PEAK_PROMINENCE_FALLBACK } = captureConfig.STEP_DETECTION;

  const dynamicProminenceThreshold = medianLegLength > 0 
    ? medianLegLength * MIN_PEAK_PROMINENCE_FRACTION 
    : MIN_PEAK_PROMINENCE_FALLBACK;

  let currentValley = absSmoothed[0] || 0;

  for (let i = 1; i < absSmoothed.length - 1; i++) {
    const prev = absSmoothed[i - 1];
    const curr = absSmoothed[i];
    const next = absSmoothed[i + 1];
    const time = timestamps[i];

    // Track the lowest point seen since the last peak
    currentValley = Math.min(currentValley, curr);

    // Is it a local maximum?
    if (curr > prev && curr > next) {
      const prominence = curr - currentValley;
      
      // Is it prominent enough?
      if (prominence >= dynamicProminenceThreshold) {
        // Is it far enough from the last step?
        if (time - lastStepTime >= MIN_TIME_BETWEEN_STEPS_MS) {
          stepCount++;
          stepTimestamps.push(time);
          lastStepTime = time;
          currentValley = curr; // Reset valley after detecting a valid peak
        }
      }
    }
  }

  // Calculate cadence (steps per minute)
  const durationMs = timestamps[timestamps.length - 1] - timestamps[0];
  const cadence = durationMs > 0 ? (stepCount / (durationMs / 60000)) : 0;

  return { stepCount, stepTimestamps, cadence };
}
