import API from "./client";
import * as FileSystem from "expo-file-system";
import FormData from "form-data";

// ============= GET CURRENT USER =============
export const getCurrentUser = async () => {
  try {
    const res = await API.get("/users/me");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    throw error;
  }
};

// ============= GET USER PROFILE BY ID =============
export const getUserProfile = async (userId: string) => {
  try {
    const res = await API.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

// ============= GET USER POSTS =============
export const getUserPosts = async (userId: string, limit: number = 20) => {
  try {
    const res = await API.get(`/users/${userId}/posts?limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    throw error;
  }
};

// ============= UPDATE PROFILE =============
export const updateProfile = async (data: {
  username?: string;
  full_name?: string;
  bio?: string;
  profile_pic?: string; // image URI
  position?: string;
  preferred_foot?: string;
  jersey_number?: number;
}) => {
  try {
    const formData = new FormData();

    if (data.username) formData.append("username", data.username);
    if (data.full_name) formData.append("full_name", data.full_name);
    if (data.bio) formData.append("bio", data.bio);
    if (data.position) formData.append("position", data.position);
    if (data.preferred_foot) formData.append("preferred_foot", data.preferred_foot);
    if (data.jersey_number) formData.append("jersey_number", data.jersey_number);

    // If profile pic provided, add it
    if (data.profile_pic) {
      const response = await FileSystem.readAsStringAsync(data.profile_pic, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = new Blob([Buffer.from(response, "base64")], {
        type: "image/jpeg",
      });
      formData.append("profile_pic", blob, "profile.jpg");
    }

    const res = await API.put("/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

// ============= FOLLOW USER =============
export const followUser = async (userId: string) => {
  try {
    const res = await API.post(`/users/${userId}/follow`);
    return res.data;
  } catch (error) {
    console.error("Failed to follow user:", error);
    throw error;
  }
};

// ============= UNFOLLOW USER =============
export const unfollowUser = async (userId: string) => {
  try {
    const res = await API.post(`/users/${userId}/unfollow`);
    return res.data;
  } catch (error) {
    console.error("Failed to unfollow user:", error);
    throw error;
  }
};

// ============= GET FOLLOWERS =============
export const getFollowers = async (userId: string) => {
  try {
    const res = await API.get(`/users/${userId}/followers`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch followers:", error);
    throw error;
  }
};

// ============= GET FOLLOWING =============
export const getFollowing = async (userId: string) => {
  try {
    const res = await API.get(`/users/${userId}/following`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch following:", error);
    throw error;
  }
};

// ============= GET USER STATS =============
export const getUserStats = async (userId: string) => {
  try {
    const res = await API.get(`/users/${userId}/stats`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    throw error;
  }
};

// ============= SEARCH USERS =============
export const searchUsers = async (query: string) => {
  try {
    const res = await API.get(`/users/search?q=${query}`);
    return res.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw error;
  }
};

// ============= GET LEADERBOARD =============
export const getLeaderboard = async (
  sortBy: "rating" | "goals" | "matches" = "rating",
  limit: number = 10
) => {
  try {
    const res = await API.get(`/users/leaderboard?sort=${sortBy}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    throw error;
  }
};
