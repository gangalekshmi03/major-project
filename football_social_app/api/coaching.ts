import API from "./client";

/**
 * AI COACHING MODULE - Connects to FastAPI Backend
 * Backend: /coaching/* endpoints
 * Mock data for now, TODO: Integrate with ML models for real insights
 */

// ============= GET AI COACHING PLAN =============
// Backend: GET /coaching/plan
export const getCoachingPlan = async (userId?: string) => {
  try {
    const endpoint = userId
      ? `/coaching/plan?user_id=${userId}`
      : "/coaching/plan";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch coaching plan:", error);
    throw error;
  }
};

// ============= GET POSITION RECOMMENDATION =============
// Backend: GET /coaching/position
// TODO: ML team integrates position analysis here
export const getPositionRecommendation = async (userId?: string) => {
  try {
    const endpoint = userId
      ? `/coaching/position?user_id=${userId}`
      : "/coaching/position";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to get position recommendation:", error);
    throw error;
  }
};

// ============= GET STRENGTHS ANALYSIS =============
// Backend: GET /coaching/strengths
// TODO: ML team integrates strength detection here
export const getStrengthsAnalysis = async (userId?: string) => {
  try {
    const endpoint = userId
      ? `/coaching/strengths?user_id=${userId}`
      : "/coaching/strengths";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch strengths analysis:", error);
    throw error;
  }
};

// ============= GET WEAKNESSES & IMPROVEMENTS =============
// Backend: GET /coaching/weaknesses
// TODO: ML team integrates weakness analysis here
export const getWeaknessesAnalysis = async (userId?: string) => {
  try {
    const endpoint = userId
      ? `/coaching/weaknesses?user_id=${userId}`
      : "/coaching/weaknesses";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch weaknesses analysis:", error);
    throw error;
  }
};

// ============= GET WEEKLY TRAINING PLAN =============
// Backend: GET /coaching/training-plan
export const getWeeklyTrainingPlan = async (position?: string) => {
  try {
    const endpoint = position
      ? `/coaching/training-plan?position=${position}`
      : "/coaching/training-plan";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch training plan:", error);
    throw error;
  }
};

// ============= GET MOTIVATIONAL INSIGHT =============
// Backend: GET /coaching/motivation
// TODO: Integrate with GPT for personalized motivation
export const getMotivationalInsight = async (userId?: string) => {
  try {
    const endpoint = userId
      ? `/coaching/motivation?user_id=${userId}`
      : "/coaching/motivation";
    const res = await API.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch motivation:", error);
    throw error;
  }
};

// ============= SAVE ACHIEVEMENT FROM COACHING =============
// Backend: POST /coaching/save-achievement
export const saveCoachingAchievement = async (achievementData: {
  title: string;
  description: string;
  icon?: string;
}) => {
  try {
    const res = await API.post("/coaching/save-achievement", achievementData);
    return res.data;
  } catch (error) {
    console.error("Failed to save achievement:", error);
    throw error;
  }
};

// ============= GET COACHING HISTORY =============
// Backend: GET /coaching/history
export const getCoachingHistory = async () => {
  try {
    const res = await API.get("/coaching/history");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch coaching history:", error);
    throw error;
  }
};
