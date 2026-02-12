import API, { analyzerClient } from "./client";
import * as FileSystem from "expo-file-system";
import FormData from "form-data";

/**
 * PERFORMANCE MODULE - Connects to FastAPI Backend
 * Backend: POST /performance/upload
 * Cloudinary integration for video storage
 */

// ============= VIDEO UPLOAD =============
export const uploadPerformanceVideo = async (
  videoUri: string,
  matchType: string,
  position?: string,
  matchDate?: string
) => {
  try {
    const formData = new FormData();

    // Read video file
    const response = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64',
    });

    // Create blob from base64
    const blob = new Blob([Buffer.from(response, "base64")], {
      type: "video/mp4",
    });

    formData.append("video", blob, "match_video.mp4");
    formData.append("match_type", matchType);
    if (position) formData.append("position", position);
    if (matchDate) formData.append("match_date", matchDate);

    const res = await API.post("/performance/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Video upload error:", error);
    throw error;
  }
};

// ============= GET ANALYSIS RESULTS =============
// Backend: GET /performance/analysis/{video_id}
// TODO: Integrate with ML team's trained models here
export const getAnalysisResults = async (videoId: string) => {
  try {
    const res = await API.get(`/performance/analysis/${videoId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch analysis results:", error);
    throw error;
  }
};

// ============= GENERATE PLAYER CARD FROM ANALYSIS =============
// Backend: POST /performance/player-card
export const generatePlayerCard = async (analysisId: string) => {
  try {
    const res = await API.post(`/performance/player-card`, {
      analysis_id: analysisId,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to generate player card:", error);
    throw error;
  }
};

// ============= GET USER PERFORMANCE HISTORY =============
// Backend: GET /performance/user
export const getUserPerformanceHistory = async () => {
  try {
    const res = await API.get(`/performance/user`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch performance history:", error);
    throw error;
  }
};

// ============= SUBMIT TO ML SERVICE =============
// Backend: POST /performance/ml-process
// TODO: ML team integrates model submission here
export const submitToMLService = async (videoUrl: string) => {
  try {
    const res = await API.post("/performance/ml-process", {
      video_url: videoUrl,
    });
    return res.data;
  } catch (error) {
    console.error("ML processing error:", error);
    throw error;
  }
};

// ============= POLL ML STATUS =============
// Backend: GET /performance/ml-status/{job_id}
// TODO: ML team integrates status polling here
export const checkMLStatus = async (jobId: string) => {
  try {
    const res = await API.get(`/performance/ml-status/${jobId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to check ML status:", error);
    throw error;
  }
};

// ============= FOOTBALL PERFORMANCE ANALYZER (FLASK) =============
// Service: http://<analyzer-host>:5000

export const uploadAnalyzerVideo = async (videoUri: string) => {
  try {
    const formData = new FormData();

    const response = await FileSystem.readAsStringAsync(videoUri, {
      encoding: "base64",
    });

    const blob = new Blob([Buffer.from(response, "base64")], {
      type: "video/mp4",
    });

    formData.append("video", blob, "match_video.mp4");

    const res = await analyzerClient.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Analyzer upload error:", error);
    throw error;
  }
};

export const startAnalyzerProcess = async (data: {
  session_id: string;
  video_path?: string;
  fps?: number;
}) => {
  try {
    const res = await analyzerClient.post("/api/process", data);
    return res.data;
  } catch (error) {
    console.error("Analyzer process error:", error);
    throw error;
  }
};

export const getAnalyzerStatus = async (sessionId: string) => {
  try {
    const res = await analyzerClient.get("/api/process/status", {
      params: { session_id: sessionId },
    });
    return res.data;
  } catch (error) {
    console.error("Analyzer status error:", error);
    throw error;
  }
};

export const streamAnalyzerFrames = async (params: {
  session_id: string;
  video_path: string;
}) => {
  try {
    const res = await analyzerClient.get("/api/stream/frames", {
      params,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (error) {
    console.error("Analyzer stream error:", error);
    throw error;
  }
};

export const getAnalyzerPlayerCard = async (params: {
  session_id: string;
  player_id: number | string;
  format?: "json" | "image";
}) => {
  try {
    const { session_id, player_id, format = "json" } = params;
    const res = await analyzerClient.get(`/api/player/${player_id}/card`, {
      params: { session_id, format },
    });
    return res.data;
  } catch (error) {
    console.error("Analyzer player card error:", error);
    throw error;
  }
};

export const getAnalyzerPlayerHeatmap = async (params: {
  session_id: string;
  player_id: number | string;
}) => {
  try {
    const { session_id, player_id } = params;
    const res = await analyzerClient.get(`/api/player/${player_id}/heatmap`, {
      params: { session_id },
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (error) {
    console.error("Analyzer heatmap error:", error);
    throw error;
  }
};

export const getAnalyzerPlayerRecovery = async (params: {
  session_id: string;
  player_id: number | string;
}) => {
  try {
    const { session_id, player_id } = params;
    const res = await analyzerClient.get(`/api/player/${player_id}/recovery`, {
      params: { session_id },
    });
    return res.data;
  } catch (error) {
    console.error("Analyzer recovery error:", error);
    throw error;
  }
};
