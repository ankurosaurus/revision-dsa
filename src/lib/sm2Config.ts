/**
 * Configurable SuperMemo SM-2 Algorithm Weights
 */
export const SM2_CONFIG = {
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,
  EASY_BONUS: 0.15,
  HARD_PENALTY: 0.15,
  AGAIN_PENALTY: 0.2,
  FIRST_INTERVAL: 1,
  SECOND_INTERVAL: 6,
} as const;
