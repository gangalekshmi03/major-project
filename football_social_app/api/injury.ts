import API from "./client";

/**
 * INJURY & RECOVERY MODULE - Connects to FastAPI Backend
 * Backend: /injury/* endpoints
 * MongoDB integration for tracking injuries and recovery progress
 */

// ============= LOG INJURY =============
// Backend: POST /injury/log
export const logInjury = async (data: {
  injury_type: string;
  pain_level: number; // 1-10
  recovery_stage: string;
  body_part?: string;
  notes?: string;
  date?: string;
}) => {
  try {
    const res = await API.post("/injury/log", data);
    return res.data;
  } catch (error) {
    console.error("Failed to log injury:", error);
    throw error;
  }
};

// ============= GET RECOVERY PLAN =============
// Backend: GET /injury/recovery-plan/{injury_id}
// TODO: ML team can integrate medical AI for personalized recovery plans
export const getRecoveryPlan = async (injuryId: string) => {
  try {
    const res = await API.get(`/injury/recovery-plan/${injuryId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch recovery plan:", error);
    throw error;
  }
};

// ============= GET REHABILITATION EXERCISES =============
// Backend: GET /injury/exercises
export const getRehabExercises = async (injuryType: string) => {
  try {
    const res = await API.get(`/injury/exercises?injury_type=${injuryType}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    throw error;
  }
};

// ============= GET RECOVERY TIMELINE =============
// Backend: GET /injury/timeline/{injury_id}
export const getRecoveryTimeline = async (injuryId: string) => {
  try {
    const res = await API.get(`/injury/timeline/${injuryId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch timeline:", error);
    throw error;
  }
};

// ============= UPDATE INJURY RECOVERY PROGRESS =============
// Backend: PUT /injury/progress/{injury_id}
export const updateRecoveryProgress = async (injuryId: string, data: {
  pain_level?: number;
  notes?: string;
  completed_exercises?: string[];
}) => {
  try {
    const res = await API.put(`/injury/progress/${injuryId}`, data);
    return res.data;
  } catch (error) {
    console.error("Failed to update recovery progress:", error);
    throw error;
  }
};

// ============= GET INJURY HISTORY =============
// Backend: GET /injury/history
export const getInjuryHistory = async () => {
  try {
    const res = await API.get("/injury/history");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch injury history:", error);
    throw error;
  }
};

// ============= GET CURRENT ACTIVE INJURIES =============
// Backend: GET /injury/active
export const getActiveInjuries = async () => {
  try {
    const res = await API.get("/injury/active");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch active injuries:", error);
    throw error;
  }
};

// ============= MARK INJURY AS RESOLVED =============
// Backend: PUT /injury/resolve/{injury_id}
export const resolveInjury = async (injuryId: string) => {
  try {
    const res = await API.put(`/injury/resolve/${injuryId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to resolve injury:", error);
    throw error;
  }
};
