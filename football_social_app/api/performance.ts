import API from "./client";
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
