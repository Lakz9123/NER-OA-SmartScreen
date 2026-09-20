import type { Landmark } from './types';
import { detectSteps } from './stepDetection';

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

export class KinematicsTracker {
  leftKneeAngles: number[] = [];
  rightKneeAngles: number[] = [];
  timestamps: number[] = [];
  
  // We no longer track steps natively here, we use the shared algorithm in getMetrics
  rawFrames: Landmark[][] = [];

  addFrame(landmarks: Landmark[], timestampMs: number) {
    if (!landmarks || landmarks.length < 33) return;

    this.rawFrames.push(landmarks);

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    if (leftHip.visibility > 0.5 && leftKnee.visibility > 0.5 && leftAnkle.visibility > 0.5) {
      this.leftKneeAngles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
    }
    
    if (rightHip.visibility > 0.5 && rightKnee.visibility > 0.5 && rightAnkle.visibility > 0.5) {
      this.rightKneeAngles.push(calculateAngle(rightHip, rightKnee, rightAnkle));
    }

    this.timestamps.push(timestampMs);
  }

  getMetrics() {
    // ROM is max - min angle
    const leftMin = this.leftKneeAngles.length ? Math.min(...this.leftKneeAngles) : 0;
    const leftMax = this.leftKneeAngles.length ? Math.max(...this.leftKneeAngles) : 0;
    const rightMin = this.rightKneeAngles.length ? Math.min(...this.rightKneeAngles) : 0;
    const rightMax = this.rightKneeAngles.length ? Math.max(...this.rightKneeAngles) : 0;

    const durationSeconds = this.timestamps.length > 1 
      ? (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / 1000 
      : 1;

    const { stepCount, stepTimestamps } = detectSteps(this.rawFrames, this.timestamps);

    const cadence = durationSeconds > 0 ? (stepCount / durationSeconds) * 60 : 0;
    
    // Avg knee flexion during swing phase (simplified to just avg of maxes or overall avg)
    const avgLeftAngle = this.leftKneeAngles.length ? this.leftKneeAngles.reduce((a,b)=>a+b,0)/this.leftKneeAngles.length : 180;
    const avgRightAngle = this.rightKneeAngles.length ? this.rightKneeAngles.reduce((a,b)=>a+b,0)/this.rightKneeAngles.length : 180;

    // Step time from timestamps of steps
    let step_time = 0;
    if (stepTimestamps.length >= 2) {
      const stepDurations = [];
      for (let i = 1; i < stepTimestamps.length; i++) {
        stepDurations.push(stepTimestamps[i] - stepTimestamps[i-1]);
      }
      step_time = (stepDurations.reduce((a,b)=>a+b,0) / stepDurations.length) / 1000;
    }

    const romLeft = parseFloat((leftMax - leftMin).toFixed(2));
    const romRight = parseFloat((rightMax - rightMin).toFixed(2));
    
    // Symmetry index from ROM
    let symmetry_index = 1.0;
    if (romLeft > 0 && romRight > 0) {
      symmetry_index = Math.min(romLeft, romRight) / Math.max(romLeft, romRight);
    }

    return {
      knee_angle_left: parseFloat((180 - avgLeftAngle).toFixed(2)),
      knee_angle_right: parseFloat((180 - avgRightAngle).toFixed(2)),
      knee_rom_left: romLeft,
      knee_rom_right: romRight,
      symmetry_index: parseFloat(symmetry_index.toFixed(3)),
      cadence: parseFloat(cadence.toFixed(2)),
      gait_speed: parseFloat(((cadence / 60) * 0.65).toFixed(2)), 
      step_length: 0.65,
      step_time: parseFloat(step_time.toFixed(3))
    };
  }
}
