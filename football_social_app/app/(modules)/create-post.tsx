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
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { createPost } from "@/api/posts";
import { useAuth } from "@/context/useAuth";
import * as ImagePicker from "expo-image-picker";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
  "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
  "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
  "🎉", "🎊", "🎈", "🎁", "⚽", "🏀", "🏈", "⚾",
  "🥎", "🎾", "🏐", "🏉", "🥏", "🎳", "🏓", "🏸",
  "🏒", "🏑", "🥊", "🥋", "🥅", "⛳", "⛸", "🎣",
  "🚣", "🏊", "⛹", "🏋", "🚴", "🚵", "🤸", "⛷",
  "🏂", "🪂", "🤺", "🤼", "🤾", "🏌", "🏇", "🧘",
  "🎽", "🎖", "🏆", "🏅", "🥇", "🥈", "🥉", "👏",
];


export default function CreatePostScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedMedia([...selectedMedia, { ...result.assets[0], type: "image" }]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });

      if (!result.canceled) {
        setSelectedMedia([...selectedMedia, { ...result.assets[0], type: "video" }]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video");
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(newMedia);
  };

  const addEmoji = (emoji: string) => {
    setContent(content + emoji);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something for your post");
      return;
    }

    try {
      setLoading(true);
      await createPost({
        content: content,
      });

      Alert.alert("Success", "Post created!");
      router.back();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail || error.message || "Failed to create post";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={loading || !content.trim()}
          >
            <Text
              style={[
                styles.postButton,
                { opacity: loading || !content.trim() ? 0.5 : 1 },
              ]}
            >
              Post
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

          <TouchableOpacity style={styles.actionButton} onPress={pickVideo} disabled={loading}>
            <MaterialCommunityIcons name="video-outline" size={24} color="#4ECDC4" />
            <Text style={styles.actionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowEmojiPicker(!showEmojiPicker)} disabled={loading}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#FFD93D" />
            <Text style={styles.actionText}>Emoji</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Media Preview */}
        {selectedMedia.length > 0 && (
          <View style={styles.mediaPreviewSection}>
            <Text style={styles.mediaPreviewTitle}>Selected Media ({selectedMedia.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedMedia.map((media, index) => (
                <View key={index} style={styles.mediaPreviewItem}>
                  {media.type === "image" ? (
                    <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
                  ) : (
                    <View style={styles.videoPreview}>
                      <MaterialCommunityIcons name="video" size={40} color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => removeMedia(index)}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Creating post...</Text>
          </View>
        )}

        {/* Emoji Picker Modal */}
        <Modal
          visible={showEmojiPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiModalContainer}>
            <View style={styles.emojiModalContent}>
              <View style={styles.emojiModalHeader}>
                <Text style={styles.emojiModalTitle}>Select Emoji</Text>
                <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={EMOJIS}
                numColumns={8}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.emojiItem}
                    onPress={() => addEmoji(item)}
                  >
                    <Text style={styles.emoji}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={true}
              />
            </View>
          </View>
        </Modal>
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
    marginRight: 12,
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  videoPreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
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
  emojiModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  emojiModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  emojiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  emoji: {
    fontSize: 32,
  },
});
