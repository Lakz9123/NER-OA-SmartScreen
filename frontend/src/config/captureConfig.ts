export const captureConfig = {
  // Duration
  RECORDING_DURATION_MS: 10000,
  COUNTDOWN_DURATION_SEC: 3,

  // Visibility Requirements
  MIN_LANDMARK_VISIBILITY: 0.5,
  
  // Quality Check Thresholds
  MIN_FRAMES_FOR_VALID_CAPTURE: 10,
  MIN_STEPS_REQUIRED: 3,
  MIN_LEGS_VISIBLE_PCT: 0.5, // 50% of frames must have both knees/ankles
  MAX_OUT_OF_BOUNDS_PCT: 0.3, // Max 30% of frames can have body out of frame
  
  // Step Detection Tuning
  // The step detection uses relative distance between the ankles and the hip midpoint.
  STEP_DETECTION: {
    MOVING_AVERAGE_WINDOW: 5,   // Number of frames to smooth over
    MIN_TIME_BETWEEN_STEPS_MS: 300, // Minimum time (ms) to wait before detecting another step
    PROMINENCE_THRESHOLD: 0.08, // The minimum relative X-distance to count as a step peak
  }
};
