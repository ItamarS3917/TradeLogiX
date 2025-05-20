// src/constants/tradeEnums.js
export const PLAN_ADHERENCE = {
  FOLLOWED: "FOLLOWED",
  PARTIAL: "PARTIAL", 
  DEVIATED: "DEVIATED",
  NO_PLAN: "NO_PLAN"
};

export const EMOTIONAL_STATE = {
  CALM: "CALM",
  FOCUSED: "FOCUSED",
  ANXIOUS: "ANXIOUS",
  FOMO: "FOMO",
  GREEDY: "GREEDY",
  FEARFUL: "FEARFUL",
  TILTED: "TILTED",
  CONFIDENT: "CONFIDENT"
};

export const TRADE_OUTCOME = {
  WIN: "WIN",
  LOSS: "LOSS",
  BREAKEVEN: "BREAKEVEN"
};

// Map numeric values to enum strings (for backward compatibility)
export const numericToPlanAdherence = {
  1: "FOLLOWED",
  2: "PARTIAL",
  3: "DEVIATED", 
  4: "NO_PLAN",
  5: "FOLLOWED", // Default to FOLLOWED for invalid values
  6: "FOLLOWED",
  7: "FOLLOWED",
  8: "FOLLOWED",
  9: "FOLLOWED",
  10: "FOLLOWED"
};

export const numericToEmotionalState = {
  1: "CALM",
  2: "FOCUSED",
  3: "ANXIOUS",
  4: "FOMO",
  5: "GREEDY",
  6: "FEARFUL",
  7: "TILTED",
  8: "CONFIDENT",
  9: "CALM", // Default to CALM for invalid values
  10: "CALM"
};
