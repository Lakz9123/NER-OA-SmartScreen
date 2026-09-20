import type { Landmark } from './types';
import { captureConfig } from '../config/captureConfig';

export interface StepResult {
  stepCount: number;
  stepTimestamps: number[];
}

export function detectSteps(frames: Landmark[][], timestamps: number[]): StepResult {
  if (frames.length === 0 || frames.length !== timestamps.length) {
    return { stepCount: 0, stepTimestamps: [] };
  }

  // 1. Calculate raw relative ankle distances
  const rawDistances: number[] = [];
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
      const hipMidpointX = (leftHip.x + rightHip.x) / 2;
      // Use absolute distance between ankles, or distance relative to hip?
      // The prompt suggests "ankle x-position relative to the body's hip midpoint"
      // But standard gait distance is just abs(leftAnkle.x - rightAnkle.x).
      // Let's use the maximum offset of any ankle from the hip midpoint to capture 
      // the peak of the stride when viewed from the side.
      const leftDist = Math.abs(leftAnkle.x - hipMidpointX);
      const rightDist = Math.abs(rightAnkle.x - hipMidpointX);
      rawDistances.push(Math.max(leftDist, rightDist));
    } else {
      rawDistances.push(0);
    }
  }

  // 2. Smooth with moving average
  const windowSize = captureConfig.STEP_DETECTION.MOVING_AVERAGE_WINDOW;
  const smoothedDistances: number[] = [];
  
  for (let i = 0; i < rawDistances.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += rawDistances[j];
      count++;
    }
    smoothedDistances.push(sum / count);
  }

  // 3. Peak detection
  let stepCount = 0;
  const stepTimestamps: number[] = [];
  let lastStepTime = 0;
  const { MIN_TIME_BETWEEN_STEPS_MS, PROMINENCE_THRESHOLD } = captureConfig.STEP_DETECTION;

  for (let i = 1; i < smoothedDistances.length - 1; i++) {
    const prev = smoothedDistances[i - 1];
    const curr = smoothedDistances[i];
    const next = smoothedDistances[i + 1];
    const time = timestamps[i];

    // Is it a local maximum?
    if (curr > prev && curr > next) {
      // Is it prominent enough?
      if (curr >= PROMINENCE_THRESHOLD) {
        // Is it far enough from the last step?
        if (time - lastStepTime >= MIN_TIME_BETWEEN_STEPS_MS) {
          stepCount++;
          stepTimestamps.push(time);
          lastStepTime = time;
        }
      }
    }
  }

  return { stepCount, stepTimestamps };
}
