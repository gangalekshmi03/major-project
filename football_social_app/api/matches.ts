import API from "./client";

/**
 * MATCHES MODULE - Connects to FastAPI Backend
 * Backend: /matches/* endpoints
 * MongoDB integration for organizing and tracking matches
 */

// ============= CREATE MATCH =============
// Backend: POST /matches/create
export const createMatch = async (data: {
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  match_type: string; // "friendly" | "league" | "tournament"
  description?: string;
}) => {
  try {
    const res = await API.post("/matches/create", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create match:", error);
    throw error;
  }
};

// ============= GET ALL MATCHES =============
// Backend: GET /matches/all
export const getAllMatches = async (
  filter: "all" | "upcoming" | "completed" = "all",
  limit: number = 20,
  page: number = 1
) => {
  try {
    const res = await API.get(`/matches/all?filter=${filter}&limit=${limit}&page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    throw error;
  }
};

// ============= GET MATCH DETAILS =============
// Backend: GET /matches/{match_id}
export const getMatchDetails = async (matchId: string) => {
  try {
    const res = await API.get(`/matches/${matchId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch match details:", error);
    throw error;
  }
};

// ============= JOIN MATCH =============
// Backend: POST /matches/{match_id}/join
export const joinMatch = async (matchId: string) => {
  try {
    const res = await API.post(`/matches/${matchId}/join`);
    return res.data;
  } catch (error) {
    console.error("Failed to join match:", error);
    throw error;
  }
};

// ============= LEAVE MATCH =============
// Backend: POST /matches/{match_id}/leave
export const leaveMatch = async (matchId: string) => {
  try {
    const res = await API.post(`/matches/${matchId}/leave`);
    return res.data;
  } catch (error) {
    console.error("Failed to leave match:", error);
    throw error;
  }
};

// ============= GET MATCH PARTICIPANTS =============
// Backend: GET /matches/{match_id}/participants
export const getMatchParticipants = async (matchId: string) => {
  try {
    const res = await API.get(`/matches/${matchId}/participants`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    throw error;
  }
};

// ============= UPLOAD MATCH VIDEO =============
// Backend: POST /matches/{match_id}/video
export const uploadMatchVideo = async (matchId: string, videoUri: string) => {
  try {
    const response = await fetch(videoUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("video", blob, "match_video.mp4");

    const res = await API.post(`/matches/${matchId}/video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Failed to upload match video:", error);
    throw error;
  }
};

// ============= UPDATE MATCH SCORE =============
// Backend: PUT /matches/{match_id}/score
export const updateMatchScore = async (
  matchId: string,
  data: {
    home_goals: number;
    away_goals: number;
    status: "ongoing" | "completed";
  }
) => {
  try {
    const res = await API.put(`/matches/${matchId}/score`, data);
    return res.data;
  } catch (error) {
    console.error("Failed to update match score:", error);
    throw error;
  }
};

// ============= GET USER MATCH HISTORY =============
// Backend: GET /matches/history/user
export const getUserMatchHistory = async (userId?: string) => {
  try {
    const res = await API.get("/matches/history/user");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch match history:", error);
    throw error;
  }
};

// ============= DELETE MATCH =============
// Backend: DELETE /matches/{match_id}
export const deleteMatch = async (matchId: string) => {
  try {
    const res = await API.delete(`/matches/${matchId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete match:", error);
    throw error;
  }
};
