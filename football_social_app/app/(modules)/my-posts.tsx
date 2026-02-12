import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { getUserPosts, deletePost } from "@/api/posts";
import { useAuth } from "@/context/useAuth";

export default function MyPostsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUserPosts();
    }, [])
  );

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      console.log("Fetching posts for user:", user?.id);
      const response = await getUserPosts(user?.id);
      console.log("Posts response:", response);
      if (response.posts) {
        setPosts(response.posts);
      } else if (Array.isArray(response)) {
        setPosts(response);
      }
    } catch (error: any) {
      console.error("Failed to load user posts:", error);
      Alert.alert("Error", "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            console.log("=== DELETE POST ATTEMPT ===");
            console.log("Post ID:", postId);
            console.log("User ID:", user?.id);
            
            const response = await deletePost(postId);
            console.log("Delete response:", response);
            
            Alert.alert("Success", "Post deleted!");
            setTimeout(() => loadUserPosts(), 500);
          } catch (error: any) {
            console.error("=== DELETE ERROR ===");
            console.error("Full error:", error);
            console.error("Response data:", error.response?.data);
            console.error("Message:", error.message);
            
            const errorMsg = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           error.message || 
                           "Failed to delete post";
            Alert.alert("Error", `Delete failed: ${errorMsg}`);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditPost = (postId: string) => {
    router.push({
      pathname: "/(modules)/edit-post",
      params: { postId },
    } as any);
  };

  const handleCreateNewPost = () => {
    router.push({
      pathname: "/(modules)/create-post",
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateNewPost}>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="pencil-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyText}>
            Create your first post to share with the community
          </Text>
          <TouchableOpacity
            style={styles.createFirstPostBtn}
            onPress={handleCreateNewPost}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.createFirstPostBtnText}>Create First Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postCardHeader}>
                <View style={styles.postCardInfo}>
                  <Text style={styles.postContent} numberOfLines={2}>
                    {post.content}
                  </Text>
                  <Text style={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleEditPost(post._id)}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={18}
                      color="#4ECDC4"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDeletePost(post._id)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={18}
                      color="#FF6B6B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                />
              )}

              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={16}
                    color="#FF6B6B"
                  />
                  <Text style={styles.statText}>
                    {post.likes?.length || 0} likes
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="comment"
                    size={16}
                    color="#4ECDC4"
                  />
                  <Text style={styles.statText}>
                    {post.comments?.length || 0} comments
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  createBtn: {
    backgroundColor: "#FF6B6B",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  postCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  postContent: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    marginBottom: 6,
    lineHeight: 20,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  postActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  createFirstPostBtn: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },
  createFirstPostBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
