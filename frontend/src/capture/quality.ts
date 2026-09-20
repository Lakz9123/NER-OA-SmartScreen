import type { Landmark } from '../utils/kinematics';

export interface QualityAssessment {
  is_good: boolean;
  reason: string;
  score: number;
  metrics: {
    hipsVisible: number;
    kneesVisible: number;
    anklesVisible: number;
    wholeBodyInFrame: boolean;
    frameCount: number;
    stepCount: number;
  };
}

export function assessCaptureQuality(frames: Landmark[][]): QualityAssessment {
  if (!frames || frames.length === 0) {
    return {
      is_good: false,
      reason: "No video frames were captured.",
      score: 0,
      metrics: { hipsVisible: 0, kneesVisible: 0, anklesVisible: 0, wholeBodyInFrame: false, frameCount: 0, stepCount: 0 }
    };
  }

  let hipsVisibleCount = 0;
  let kneesVisibleCount = 0;
  let anklesVisibleCount = 0;
  let outOfBoundsCount = 0;

  // Simple step detection
  let stepCount = 0;
  let isStepActive = false;
  
  for (const frame of frames) {
    if (frame.length < 33) continue;

    const leftHip = frame[23];
    const rightHip = frame[24];
    const leftKnee = frame[25];
    const rightKnee = frame[26];
    const leftAnkle = frame[27];
    const rightAnkle = frame[28];
    const leftShoulder = frame[11];
    const rightShoulder = frame[12];

    const hipsVis = leftHip.visibility > 0.5 && rightHip.visibility > 0.5;
    const kneesVis = leftKnee.visibility > 0.5 && rightKnee.visibility > 0.5;
    const anklesVis = leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5;

    if (hipsVis) hipsVisibleCount++;
    if (kneesVis) kneesVisibleCount++;
    if (anklesVis) anklesVisibleCount++;

    // Check if body is in frame (shoulders to ankles should be within 0.0 to 1.0)
    const keyLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
    const isOutOfBounds = keyLandmarks.some(l => 
      l.visibility > 0.5 && (l.x < 0.0 || l.x > 1.0 || l.y < 0.0 || l.y > 1.0)
    );
    if (isOutOfBounds) {
      outOfBoundsCount++;
    }

    // Naive step detection on raw frames to ensure enough steps were taken
    if (anklesVis) {
      const dist = Math.abs(leftAnkle.x - rightAnkle.x);
      if (dist > 0.1 && !isStepActive) {
        isStepActive = true;
        stepCount++;
      } else if (dist < 0.05 && isStepActive) {
        isStepActive = false;
      }
    }
  }

  const frameCount = frames.length;
  const hipsVisiblePct = hipsVisibleCount / frameCount;
  const kneesVisiblePct = kneesVisibleCount / frameCount;
  const anklesVisiblePct = anklesVisibleCount / frameCount;
  const outOfBoundsPct = outOfBoundsCount / frameCount;

  let score = 100;
  let is_good = true;
  let reason = "Good capture quality.";

  // Thresholds
  if (frameCount < 10) {
    is_good = false;
    reason = "Capture duration was too short.";
    score = 10;
  } else if (anklesVisiblePct < 0.5 || kneesVisiblePct < 0.5) {
    is_good = false;
    reason = "Legs were cut off or not clearly visible in the frame.";
    score = Math.min(score, 30);
  } else if (outOfBoundsPct > 0.3) {
    is_good = false;
    reason = "Subject moved out of frame too frequently.";
    score = Math.min(score, 40);
  } else if (stepCount < 3) {
    is_good = false;
    reason = "Too few steps detected. Please walk continuously.";
    score = Math.min(score, 50);
  }

  // Deduct score for partial visibility
  score -= (1 - anklesVisiblePct) * 20;
  score -= (1 - kneesVisiblePct) * 10;
  score -= outOfBoundsPct * 30;

  score = Math.max(0, Math.round(score));

  return {
    is_good,
    reason,
    score,
    metrics: {
      hipsVisible: hipsVisiblePct,
      kneesVisible: kneesVisiblePct,
      anklesVisible: anklesVisiblePct,
      wholeBodyInFrame: outOfBoundsPct <= 0.3,
      frameCount,
      stepCount
    }
  };
}
