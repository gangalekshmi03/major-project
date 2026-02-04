import API from "./client";
import * as FileSystem from "expo-file-system";
import FormData from "form-data";

// ============= CREATE POST =============
export const createPost = async (data: {
  content: string;
  image?: string; // image URI
  type?: "post" | "achievement" | "playercard"; // type of post
  video_id?: string; // if it's a player card from analysis
}) => {
  try {
    const formData = new FormData();

    formData.append("content", data.content);
    if (data.type) formData.append("post_type", data.type);
    if (data.video_id) formData.append("video_id", data.video_id);

    // If image provided, add it
    if (data.image) {
      const response = await FileSystem.readAsStringAsync(data.image, {
        encoding: "base64",
      });
      const blob = new Blob([Buffer.from(response, "base64")], {
        type: "image/jpeg",
      });
      formData.append("image", blob, "post_image.jpg");
    }

    const res = await API.post("/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

// ============= GET FEED =============
export const getFeed = async (limit: number = 20, page: number = 1) => {
  try {
    const res = await API.get(`/posts/feed?limit=${limit}&page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    throw error;
  }
};

// ============= GET USER'S POSTS =============
export const getUserPosts = async (userId?: string, limit: number = 20, page: number = 1) => {
  try {
    const url = userId ? `/posts/user/${userId}` : `/posts/my-posts`;
    const res = await API.get(url);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    throw error;
  }
};

// ============= GET POST BY ID =============
export const getPostById = async (postId: string) => {
  try {
    const res = await API.get(`/posts/post/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    throw error;
  }
};

// ============= LIKE POST =============
export const likePost = async (postId: string) => {
  try {
    const res = await API.post(`/posts/like/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to like post:", error);
    throw error;
  }
};

// ============= UNLIKE POST =============
export const unlikePost = async (postId: string) => {
  try {
    const res = await API.post(`/posts/unlike/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to unlike post:", error);
    throw error;
  }
};

// ============= ADD COMMENT =============
export const addComment = async (postId: string, content: string) => {
  try {
    const res = await API.post(`/posts/${postId}/comment`, { content });
    return res.data;
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
};

// ============= DELETE COMMENT =============
export const deleteComment = async (postId: string, commentId: string) => {
  try {
    const res = await API.delete(`/posts/${postId}/comment/${commentId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};

// ============= GET COMMENTS =============
export const getComments = async (postId: string) => {
  try {
    const res = await API.get(`/posts/${postId}/comments`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }
};

// ============= DELETE POST =============
export const deletePost = async (postId: string) => {
  try {
    const res = await API.delete(`/posts/post/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
};

// ============= UPDATE POST =============
export const updatePost = async (postId: string, data: {
  content: string;
  image?: string;
  type?: "post" | "achievement" | "playercard";
}) => {
  try {
    const formData = new FormData();
    formData.append("content", data.content);
    if (data.type) formData.append("post_type", data.type);
    
    if (data.image && data.image.startsWith("file://")) {
      const response = await FileSystem.readAsStringAsync(data.image, {
        encoding: "base64",
      });
      const blob = new Blob([Buffer.from(response, "base64")], {
        type: "image/jpeg",
      });
      formData.append("image", blob, "post_image.jpg");
    }

    const res = await API.put(`/posts/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Failed to update post:", error);
    throw error;
  }
};

// ============= SHARE POST =============
export const sharePost = async (postId: string) => {
  try {
    const res = await API.post(`/posts/${postId}/share`);
    return res.data;
  } catch (error) {
    console.error("Failed to share post:", error);
    throw error;
  }
};
