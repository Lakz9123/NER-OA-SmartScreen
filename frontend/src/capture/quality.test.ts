import { describe, it, expect } from 'vitest';
import { assessCaptureQuality } from './quality';
import type { Landmark } from '../utils/types';

const createMockLandmark = (x: number, y: number, visibility: number = 0.9): Landmark => ({ x, y, z: 0, visibility });

const generateFrames = (
  count: number,
  anklesVisible: boolean,
  inFrame: boolean,
  hasSteps: boolean
): Landmark[][] => {
  const frames: Landmark[][] = [];
  const fps = 15;

  for (let i = 0; i < count; i++) {
    const frame: Landmark[] = new Array(33).fill(createMockLandmark(0.5, 0.5, 0));
    
    const vis = 0.9;
    const yPos = inFrame ? 0.5 : 1.5; 
    const hipX = 0.5;
    
    frame[11] = createMockLandmark(hipX, yPos - 0.2, vis); // L Shoulder
    frame[12] = createMockLandmark(hipX, yPos - 0.2, vis); // R Shoulder
    frame[23] = createMockLandmark(hipX, yPos, vis); // L Hip
    frame[24] = createMockLandmark(hipX, yPos, vis); // R Hip
    frame[25] = createMockLandmark(hipX, yPos + 0.2, vis); // L Knee
    frame[26] = createMockLandmark(hipX, yPos + 0.2, vis); // R Knee
    
    let lAnkleX = hipX;
    let rAnkleX = hipX;

    if (hasSteps) {
      // 2 steps per second
      const phase = (i / fps) * Math.PI * 2;
      lAnkleX = hipX + Math.sin(phase) * 0.15;
      rAnkleX = hipX - Math.sin(phase) * 0.15;
    }

    frame[27] = createMockLandmark(lAnkleX, yPos + 0.4, anklesVisible ? vis : 0.1);
    frame[28] = createMockLandmark(rAnkleX, yPos + 0.4, anklesVisible ? vis : 0.1);

    frames.push(frame);
  }
  return frames;
};

describe('Capture Quality Assessment', () => {
  it('passes a good capture with sufficient frames and steps', () => {
    // 60 frames (4s), ankles visible, in frame, has steps (approx 8 steps)
    const frames = generateFrames(60, true, true, true);
    const timestamps = frames.map((_, i) => i * (1000 / 15));
    const result = assessCaptureQuality(frames, timestamps);
    
    expect(result.is_good).toBe(true);
    expect(result.score).toBe(100);
  });

  it('fails when ankles are missing (legs cut off)', () => {
    const frames = generateFrames(60, false, true, true);
    const timestamps = frames.map((_, i) => i * (1000 / 15));
    const result = assessCaptureQuality(frames, timestamps);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('Legs were cut off');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('fails when subject is out of frame', () => {
    const frames = generateFrames(60, true, false, true);
    const timestamps = frames.map((_, i) => i * (1000 / 15));
    const result = assessCaptureQuality(frames, timestamps);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('out of frame');
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it('fails when too few steps are detected', () => {
    const frames = generateFrames(60, true, true, false); // No steps
    const timestamps = frames.map((_, i) => i * (1000 / 15));
    const result = assessCaptureQuality(frames, timestamps);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('Too few steps');
    expect(result.score).toBeLessThanOrEqual(50);
  });

  it('fails when frame count is too low', () => {
    const frames = generateFrames(5, true, true, false);
    const timestamps = frames.map((_, i) => i * (1000 / 15));
    const result = assessCaptureQuality(frames, timestamps);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('too short');
    expect(result.score).toBe(10);
  });
});
