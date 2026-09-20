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
    DETREND_WINDOW_MS: 2000,      // Window for removing slow moving baseline (standing/walking toward camera)
    MOVING_AVERAGE_WINDOW_MS: 200, // Milliseconds to smooth over to remove jitter
    MIN_TIME_BETWEEN_STEPS_MS: 300, // Minimum time (ms) to wait before detecting another step
    MIN_PEAK_PROMINENCE_FRACTION: 0.20, // Prominence must be >= this fraction of leg length
    MIN_PEAK_PROMINENCE_FALLBACK: 0.08, // Fallback absolute prominence if leg length unknown
    MIN_CADENCE_SPM: 30,          // Minimum steps per minute to be considered valid walking
    MAX_CADENCE_SPM: 200,         // Maximum steps per minute
  }
};
