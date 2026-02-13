import API from "./client";

/**
 * MATCHES MODULE - Connects to FastAPI Backend
 * Backend: /matches/* endpoints
 * MongoDB integration for organizing and tracking matches
 */

export type MatchStatus = "upcoming" | "live" | "completed";

export type MatchItem = {
  _id: string;
  organizer_id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  match_type: string;
  description?: string;
  max_players: number;
  participants: string[];
  participant_count: number;
  status: MatchStatus;
  score?: {
    team_a: number;
    team_b: number;
  };
};

export type MatchParticipant = {
  _id: string;
  username?: string;
  full_name?: string;
  email?: string;
};

// ============= CREATE MATCH =============
// Backend: POST /matches/create
export const createMatch = async (data: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  match_type: string; // "friendly" | "league" | "tournament"
  max_players?: number;
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
  filterBy: "all" | "upcoming" | "completed" | "my" = "all",
  limit: number = 20,
  page: number = 1
) => {
  try {
    const res = await API.get(
      `/matches/all?filter_by=${filterBy}&limit=${limit}&page=${page}`
    );
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

// ============= ADD PARTICIPANT (ORGANIZER) =============
// Backend: POST /matches/{match_id}/participants/add
export const addMatchParticipant = async (matchId: string, userId: string) => {
  try {
    const res = await API.post(`/matches/${matchId}/participants/add`, {
      user_id: userId,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to add participant:", error);
    throw error;
  }
};

// ============= REMOVE PARTICIPANT (ORGANIZER) =============
// Backend: POST /matches/{match_id}/participants/remove
export const removeMatchParticipant = async (matchId: string, userId: string) => {
  try {
    const res = await API.post(`/matches/${matchId}/participants/remove`, {
      user_id: userId,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to remove participant:", error);
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
    score: { team_a: number; team_b: number };
    status: MatchStatus;
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
