import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList, ActivityIndicator, Alert, Image } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { getFeed, likePost, unlikePost, addComment } from "../../api/posts";

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await getFeed(20, 1);
      console.log("Feed response:", response);
      
      if (response.status === "success" && response.posts) {
        setPosts(response.posts);
        // Initialize liked state based on likes array
        const likedMap: { [key: string]: boolean } = {};
        response.posts.forEach((post: any) => {
          likedMap[post._id] = post.likes?.length > 0 ? true : false;
        });
        setLiked(likedMap);
      }
    } catch (error) {
      console.error("Failed to load feed:", error);
      Alert.alert("Error", "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      if (liked[postId]) {
        await unlikePost(postId);
        setLiked({ ...liked, [postId]: false });
      } else {
        await likePost(postId);
        setLiked({ ...liked, [postId]: true });
      }
      loadFeed();
    } catch (error) {
      console.error("Failed to update like:", error);
      Alert.alert("Error", "Failed to update like");
    }
  };

  const renderPost = ({ item }: { item: any }) => {
    const getTimeSince = (date: string | Date) => {
      const now = new Date();
      const postDate = new Date(date);
      const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
      
      if (seconds < 60) return "just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    };

    const owner = item.owner || {};
    const creatorName = owner.full_name || owner.username || 'Anonymous';
    const profilePic = owner.profile_pic;

    const getAvatarEmoji = (name?: string) => {
      const emojis: { [key: string]: string } = {
        'Goalkeeper': '🧤',
        'Defender': '🛡️',
        'Midfielder': '⚽',
        'Forward': '⚡',
      };
      return emojis[name || 'Midfielder'] || '👤';
    };

    return (
      <View style={styles.post}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            {profilePic ? (
              <Image
                source={{ uri: profilePic }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{creatorName}</Text>
              <Text style={styles.meta}>{getTimeSince(item.created_at)}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Post Image */}
        {item.image_url && (
          <View style={styles.postImageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.postImageStyle}
            />
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(item._id)}
          >
            <MaterialCommunityIcons
              name={liked[item._id] ? 'heart' : 'heart-outline'}
              size={20}
              color={liked[item._id] ? '#FF6B6B' : '#999'}
            />
            <Text style={[styles.actionText, liked[item._id] && { color: '#FF6B6B' }]}>
              {item.likes?.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="comment-outline" size={20} color="#999" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#999" />
            <Text style={styles.actionText}>{item.shares || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0099FF" />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      ) : posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          onRefresh={loadFeed}
          refreshing={loading}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Create your first post or follow others!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  post: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  postContent: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  postImageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
