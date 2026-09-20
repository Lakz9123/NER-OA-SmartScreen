export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

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
  
  // To estimate cadence (steps per minute)
  ankleDistances: number[] = [];
  stepCount = 0;
  isStepActive = false;

  addFrame(landmarks: Landmark[], timestampMs: number) {
    if (!landmarks || landmarks.length < 33) return;

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

    // Naive step detection based on distance between ankles along X-axis
    if (leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5) {
      const dist = Math.abs(leftAnkle.x - rightAnkle.x);
      this.ankleDistances.push(dist);

      // Threshold for a step (very naive)
      if (dist > 0.1 && !this.isStepActive) {
        this.isStepActive = true;
        this.stepCount++;
      } else if (dist < 0.05 && this.isStepActive) {
        this.isStepActive = false;
      }
    }
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

    const cadence = durationSeconds > 0 ? (this.stepCount / durationSeconds) * 60 : 0;
    
    // Avg knee flexion during swing phase (simplified to just avg of maxes or overall avg)
    const avgLeftAngle = this.leftKneeAngles.length ? this.leftKneeAngles.reduce((a,b)=>a+b,0)/this.leftKneeAngles.length : 180;
    const avgRightAngle = this.rightKneeAngles.length ? this.rightKneeAngles.reduce((a,b)=>a+b,0)/this.rightKneeAngles.length : 180;

    return {
      knee_angle_left: parseFloat((180 - avgLeftAngle).toFixed(2)), // degrees of flexion
      knee_angle_right: parseFloat((180 - avgRightAngle).toFixed(2)),
      knee_rom_left: parseFloat((leftMax - leftMin).toFixed(2)),
      knee_rom_right: parseFloat((rightMax - rightMin).toFixed(2)),
      cadence: parseFloat(cadence.toFixed(2)),
      gait_speed: parseFloat(((cadence / 60) * 0.65).toFixed(2)), // Fake stride length 0.65m for speed
      step_length: 0.65
    };
  }
}
