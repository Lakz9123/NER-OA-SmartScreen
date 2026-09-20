import { describe, it, expect } from 'vitest';
import { detectSteps } from './stepDetection';
import type { Landmark } from './types';

const createMockLandmark = (x: number, y: number, visibility: number = 0.9): Landmark => ({ x, y, z: 0, visibility });

describe('Step Detection', () => {
  
  const generateSequence = (
    frameCount: number, 
    fps: number, 
    stridePattern: 'walk' | 'stand' | 'front-walk'
  ) => {
    const frames: Landmark[][] = [];
    const timestamps: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const frame: Landmark[] = new Array(33).fill(createMockLandmark(0.5, 0.5, 0));
      timestamps.push(i * (1000 / fps));
      
      const hipX = 0.5;
      frame[23] = createMockLandmark(hipX, 0.5, 0.9); // L Hip
      frame[24] = createMockLandmark(hipX, 0.5, 0.9); // R Hip

      let lAnkleX = 0.5;
      let rAnkleX = 0.5;

      if (stridePattern === 'walk') {
        // Simulate side-view walking (ankles move forward and backward relative to hips)
        // A sine wave simulates the pendulum motion of the legs
        // Make the frequency such that 1 full cycle (2 steps) takes about 1 second (15 frames)
        const phase = (i / fps) * Math.PI * 2; // 2 steps per second
        lAnkleX = hipX + Math.sin(phase) * 0.15;
        rAnkleX = hipX - Math.sin(phase) * 0.15;
      } else if (stridePattern === 'front-walk') {
        // Walking towards camera: ankles move up/down (Y axis), but X stays relatively stable near hips
        const phase = (i / fps) * Math.PI * 2;
        lAnkleX = hipX - 0.05 + Math.sin(phase) * 0.02; 
        rAnkleX = hipX + 0.05 + Math.cos(phase) * 0.02;
      }

      frame[27] = createMockLandmark(lAnkleX, 0.9, 0.9); // L Ankle
      frame[28] = createMockLandmark(rAnkleX, 0.9, 0.9); // R Ankle
      
      frames.push(frame);
    }
    
    return { frames, timestamps };
  };

  it('detects correct number of steps in a standard side-view walk', () => {
    // 3 seconds at 30fps = 90 frames. 2 steps per second = 6 steps.
    const { frames, timestamps } = generateSequence(90, 30, 'walk');
    const result = detectSteps(frames, timestamps);
    
    // Allow slight variance due to smoothing and edge effects
    expect(result.stepCount).toBeGreaterThanOrEqual(4);
    expect(result.stepCount).toBeLessThanOrEqual(7);
  });

  it('detects zero steps when standing still', () => {
    const { frames, timestamps } = generateSequence(60, 30, 'stand');
    const result = detectSteps(frames, timestamps);
    
    expect(result.stepCount).toBe(0);
    expect(result.stepTimestamps).toHaveLength(0);
  });

  it('detects zero steps when walking toward the camera (invalid protocol)', () => {
    const { frames, timestamps } = generateSequence(90, 30, 'front-walk');
    const result = detectSteps(frames, timestamps);
    
    // Front-walking shouldn't trigger the X-axis prominence threshold
    expect(result.stepCount).toBe(0);
  });
});
