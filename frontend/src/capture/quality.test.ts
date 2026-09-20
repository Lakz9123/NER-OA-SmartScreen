import { describe, it, expect } from 'vitest';
import { assessCaptureQuality } from './quality';
import type { Landmark } from '../utils/kinematics';

const createMockLandmark = (x: number, y: number, visibility: number = 0.9): Landmark => ({ x, y, z: 0, visibility });

const generateFrames = (
  count: number,
  anklesVisible: boolean,
  inFrame: boolean,
  steps: number
): Landmark[][] => {
  const frames: Landmark[][] = [];

  for (let i = 0; i < count; i++) {
    // Basic array with 33 items
    const frame: Landmark[] = new Array(33).fill(createMockLandmark(0.5, 0.5, 0));
    
    // Set shoulders, hips, knees
    const vis = 0.9;
    const yPos = inFrame ? 0.5 : 1.5; // If not in frame, move them out of bounds
    
    frame[11] = createMockLandmark(0.4, yPos - 0.2, vis); // L Shoulder
    frame[12] = createMockLandmark(0.6, yPos - 0.2, vis); // R Shoulder
    frame[23] = createMockLandmark(0.4, yPos, vis); // L Hip
    frame[24] = createMockLandmark(0.6, yPos, vis); // R Hip
    frame[25] = createMockLandmark(0.4, yPos + 0.2, vis); // L Knee
    frame[26] = createMockLandmark(0.6, yPos + 0.2, vis); // R Knee
    
    // Simulate steps by moving ankles apart and together
    // A step needs a frame with dist > 0.1, then a frame with dist < 0.05
    // We will place 'steps' number of wide frames at the beginning
    const isStepPhase = i < steps * 2 && i % 2 === 0;
    const dist = isStepPhase ? 0.15 : 0.02;

    frame[27] = createMockLandmark(0.5 - dist, yPos + 0.4, anklesVisible ? vis : 0.1); // L Ankle
    frame[28] = createMockLandmark(0.5 + dist, yPos + 0.4, anklesVisible ? vis : 0.1); // R Ankle

    frames.push(frame);
  }
  return frames;
};

describe('Capture Quality Assessment', () => {
  it('passes a good capture with sufficient frames and steps', () => {
    // 30 frames, ankles visible, in frame, 4 steps
    const frames = generateFrames(30, true, true, 4);
    const result = assessCaptureQuality(frames);
    
    expect(result.is_good).toBe(true);
    expect(result.score).toBe(100);
  });

  it('fails when ankles are missing (legs cut off)', () => {
    const frames = generateFrames(30, false, true, 4);
    const result = assessCaptureQuality(frames);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('Legs were cut off');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('fails when subject is out of frame', () => {
    const frames = generateFrames(30, true, false, 4);
    const result = assessCaptureQuality(frames);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('out of frame');
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it('fails when too few steps are detected', () => {
    const frames = generateFrames(30, true, true, 1); // Only 1 step
    const result = assessCaptureQuality(frames);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('Too few steps');
    expect(result.score).toBeLessThanOrEqual(50);
  });

  it('fails when frame count is too low', () => {
    const frames = generateFrames(5, true, true, 0);
    const result = assessCaptureQuality(frames);
    
    expect(result.is_good).toBe(false);
    expect(result.reason).toContain('too short');
    expect(result.score).toBe(10);
  });
});
