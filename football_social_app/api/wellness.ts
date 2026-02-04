import API from "./client";

/**
 * WELLNESS MODULE - Connects to FastAPI Backend
 * Backend: /wellness/* endpoints
 * MongoDB integration for tracking water, sleep, calories
 */

// ============= LOG WELLNESS DATA =============
// Backend: POST /wellness/log
export const logWellnessData = async (data: {
  water?: number; // liters
  sleep?: number; // hours
  calories?: number; // kcal
  date?: string; // YYYY-MM-DD
}) => {
  try {
    const res = await API.post("/wellness/log", data);
    return res.data;
  } catch (error) {
    console.error("Failed to log wellness data:", error);
    throw error;
  }
};

// ============= GET TODAY'S WELLNESS SUMMARY =============
// Backend: GET /wellness/today
export const getTodayWellnessSummary = async () => {
  try {
    const res = await API.get("/wellness/today");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch wellness summary:", error);
    throw error;
  }
};

// ============= GET WELLNESS HISTORY =============
// Backend: GET /wellness/history
export const getWellnessHistory = async (days: number = 7) => {
  try {
    const res = await API.get(`/wellness/history?days=${days}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch wellness history:", error);
    throw error;
  }
};

// ============= GET WELLNESS RECOMMENDATIONS =============
// Backend: GET /wellness/recommendations
// TODO: Integrate AI logic for personalized recommendations
export const getWellnessRecommendations = async () => {
  try {
    const res = await API.get("/wellness/recommendations");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    throw error;
  }
};

// ============= GET WEEKLY PROGRESS =============
// Backend: GET /wellness/weekly-progress
export const getWeeklyProgress = async () => {
  try {
    const res = await API.get("/wellness/weekly-progress");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch weekly progress:", error);
    throw error;
  }
};

// ============= GET WELLNESS STREAK =============
// Backend: GET /wellness/streak
export const getWellnessStreak = async () => {
  try {
    const res = await API.get("/wellness/streak");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch wellness streak:", error);
    throw error;
  }
};
