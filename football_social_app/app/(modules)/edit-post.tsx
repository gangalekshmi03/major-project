import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { updatePost, getPostById } from "@/api/posts";
import { useAuth } from "@/context/useAuth";
import * as ImagePicker from "expo-image-picker";

export default function EditPostScreen() {
  const { user } = useAuth();
  const { postId } = useLocalSearchParams();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setInitialLoading(true);
      const response = await getPostById(postId as string);
      if (response.post) {
        setContent(response.post.content);
        if (response.post.image_url) {
          setSelectedMedia([{ uri: response.post.image_url, type: "image" }]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load post");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedMedia([{ ...result.assets[0], type: "image" }]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeMedia = () => {
    setSelectedMedia([]);
  };

  const addEmoji = (emoji: string) => {
    setContent(content + emoji);
  };

  const handleUpdatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something for your post");
      return;
    }

    try {
      setLoading(true);
      await updatePost(postId as string, {
        content: content,
        image: selectedMedia[0]?.uri,
      });

      Alert.alert("Success", "Post updated!");
      router.back();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail || error.message || "Failed to update post";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Post</Text>
          <TouchableOpacity
            onPress={handleUpdatePost}
            disabled={loading || !content.trim()}
          >
            <Text
              style={[
                styles.postButton,
                { opacity: loading || !content.trim() ? 0.5 : 1 },
              ]}
            >
              Update
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <MaterialCommunityIcons name="account-circle" size={48} color="#FF6B6B" />
          </View>
          <View>
            <Text style={styles.userName}>
              {user?.username || user?.full_name || "Player"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#ccc"
            multiline
            numberOfLines={8}
            value={content}
            onChangeText={setContent}
            editable={!loading}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage} disabled={loading}>
            <MaterialCommunityIcons name="image-outline" size={24} color="#FF6B6B" />
            <Text style={styles.actionText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowEmojiPicker(!showEmojiPicker)} disabled={loading}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#FFD93D" />
            <Text style={styles.actionText}>Emoji</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Media Preview */}
        {selectedMedia.length > 0 && (
          <View style={styles.mediaPreviewSection}>
            <Text style={styles.mediaPreviewTitle}>Image</Text>
            <View style={styles.mediaPreviewItem}>
              {selectedMedia[0].type === "image" && (
                <Image source={{ uri: selectedMedia[0].uri }} style={styles.mediaPreview} />
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeMedia}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Updating post...</Text>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  postButton: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  userSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    alignItems: "center",
  },
  userAvatar: {
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  userEmail: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  inputSection: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  contentInput: {
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
  },
  actionsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  mediaPreviewSection: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  mediaPreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  mediaPreviewItem: {
    position: "relative",
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
});
