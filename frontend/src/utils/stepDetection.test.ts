import { describe, it, expect } from 'vitest';
import { detectSteps } from './stepDetection';
import type { Landmark } from './types';

const createMockLandmark = (x: number, y: number, visibility: number = 0.9): Landmark => ({ x, y, z: 0, visibility });

describe('Step Detection', () => {
  
  const generateSequence = (
    frameCount: number, 
    fps: number, 
    stridePattern: 'walk' | 'stand' | 'front-walk',
    hipHalfWidth: number = 0.0,
    jitter: number = 0.004,
    amplitude: number = 0.15,
    scale: number = 1.0,
    stepFreqHz: number = 2.0 // 2 steps/sec = 120 SPM
  ) => {
    const frames: Landmark[][] = [];
    const timestamps: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const frame: Landmark[] = new Array(33).fill(createMockLandmark(0.5, 0.5, 0));
      timestamps.push(i * (1000 / fps));
      
      const hipMidX = 0.5;
      const hipMidY = 0.5;
      const ankleMidY = 0.5 + 0.4 * scale;

      const lHipX = hipMidX - (hipHalfWidth * scale);
      const rHipX = hipMidX + (hipHalfWidth * scale);
      
      frame[23] = createMockLandmark(lHipX, hipMidY, 0.9); // L Hip
      frame[24] = createMockLandmark(rHipX, hipMidY, 0.9); // R Hip

      let lAnkleX = lHipX;
      let rAnkleX = rHipX;

      if (stridePattern === 'walk') {
        // Side-view walking: ankles swing wide
        const phase = (i / fps) * Math.PI * stepFreqHz;
        lAnkleX = hipMidX + Math.sin(phase) * (amplitude * scale);
        rAnkleX = hipMidX - Math.sin(phase) * (amplitude * scale);
      } else if (stridePattern === 'front-walk') {
        // Front-walk: ankles sway slightly, staying mostly under wide hips
        const phase = (i / fps) * Math.PI * stepFreqHz;
        lAnkleX = lHipX + Math.sin(phase) * (0.02 * scale); 
        rAnkleX = rHipX + Math.cos(phase) * (0.02 * scale);
      }

      // Add jitter
      lAnkleX += (Math.random() - 0.5) * jitter;
      rAnkleX += (Math.random() - 0.5) * jitter;

      frame[27] = createMockLandmark(lAnkleX, ankleMidY, 0.9); // L Ankle
      frame[28] = createMockLandmark(rAnkleX, ankleMidY, 0.9); // R Ankle
      
      frames.push(frame);
    }
    
    return { frames, timestamps };
  };

  it('detects correct number of steps in a standard side-view walk (10s, 30fps)', () => {
    // 10 seconds at 30fps = 300 frames. 2 steps per second = ~20 steps.
    const { frames, timestamps } = generateSequence(300, 30, 'walk', 0.0, 0.01, 0.15);
    const result = detectSteps(frames, timestamps);
    
    expect(result.stepCount).toBeGreaterThanOrEqual(15);
    expect(result.stepCount).toBeLessThanOrEqual(25);
    expect(result.cadence).toBeGreaterThanOrEqual(90);
  });

  it('counts short-stride side walks as walking (amplitude 0.05)', () => {
    const { frames, timestamps } = generateSequence(300, 30, 'walk', 0.0, 0.01, 0.05);
    const result = detectSteps(frames, timestamps);
    expect(result.stepCount).toBeGreaterThanOrEqual(15);
  });

  it('counts short-stride side walks as walking (amplitude 0.07)', () => {
    const { frames, timestamps } = generateSequence(300, 30, 'walk', 0.0, 0.01, 0.07);
    const result = detectSteps(frames, timestamps);
    expect(result.stepCount).toBeGreaterThanOrEqual(15);
  });

  it('counts walking far from the camera (half scale) as walking', () => {
    // scale = 0.5, meaning hip-to-ankle is 0.2 instead of 0.4. Amplitude is scaled down too.
    const { frames, timestamps } = generateSequence(300, 30, 'walk', 0.0, 0.01, 0.15, 0.5);
    const result = detectSteps(frames, timestamps);
    expect(result.stepCount).toBeGreaterThanOrEqual(15);
  });

  it('counts a slow side walk (66 steps/min) as walking', () => {
    // 66 SPM = 1.1 Hz
    const { frames, timestamps } = generateSequence(300, 30, 'walk', 0.0, 0.01, 0.15, 1.0, 1.1);
    const result = detectSteps(frames, timestamps);
    
    expect(result.stepCount).toBeGreaterThanOrEqual(8);
    expect(result.stepCount).toBeLessThanOrEqual(14);
    expect(result.cadence).toBeGreaterThanOrEqual(60);
    expect(result.cadence).toBeLessThanOrEqual(80);
  });

  const hipWidths = [0.04, 0.06, 0.08, 0.10];
  
  hipWidths.forEach(hw => {
    it(`detects zero steps when standing still facing camera (hipHalfWidth: ${hw})`, () => {
      const { frames, timestamps } = generateSequence(300, 30, 'stand', hw, 0.01);
      const result = detectSteps(frames, timestamps);
      expect(result.stepCount).toBe(0);
    });

    it(`detects zero steps when walking toward the camera (hipHalfWidth: ${hw})`, () => {
      const { frames, timestamps } = generateSequence(300, 30, 'front-walk', hw, 0.01);
      const result = detectSteps(frames, timestamps);
      
      // Even with slight sway and high jitter, detrending and prominence should filter it out
      expect(result.stepCount).toBeLessThanOrEqual(2); // allow max 2 noise steps, but usually 0
    });
  });

  it('detects zero steps when standing still in side view', () => {
    const { frames, timestamps } = generateSequence(300, 30, 'stand', 0.0, 0.01);
    const result = detectSteps(frames, timestamps);
    expect(result.stepCount).toBe(0);
  });

  it('detects the same number of steps regardless of framerate (15fps vs 30fps)', () => {
    // Generate 10 seconds of walking
    const seq15 = generateSequence(150, 15, 'walk', 0.0, 0.004);
    const seq30 = generateSequence(300, 30, 'walk', 0.0, 0.004);

    const result15 = detectSteps(seq15.frames, seq15.timestamps);
    const result30 = detectSteps(seq30.frames, seq30.timestamps);

    // Difference should be very small or zero
    expect(Math.abs(result15.stepCount - result30.stepCount)).toBeLessThanOrEqual(1);
  });
});
