import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/useAuth";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from "react";

type MciName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export default function HomeScreen() {
  const { user } = useAuth();

  const modules = [
    {
      id: 1,
      title: "Performance Analysis",
      description: "Upload & analyze match videos",
      icon: "video-box",
      color: "#FF6B6B",
      route: "/(modules)/performance",
    },
    {
      id: 2,
      title: "Wellness Tracking",
      description: "Log water, sleep & nutrition",
      icon: "heart-pulse",
      color: "#4ECDC4",
      route: "/(modules)/wellness",
    },
    {
      id: 3,
      title: "AI Coach",
      description: "Get personalized coaching plans",
      icon: "brain",
      color: "#95E1D3",
      route: "/(modules)/ai-coach",
    },
    {
      id: 4,
      title: "Injury & Recovery",
      description: "Track & manage injuries",
      icon: "hospital-box",
      color: "#F38181",
      route: "/(modules)/injury",
    },
  ] as const;

  type Module = (typeof modules)[number];

  const handleModulePress = (route: Module["route"]) => {
    router.push(route);
  };

  const handleCreatePost = () => {
    router.push({
      pathname: "/(modules)/create-post",
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome</Text>
              <Text style={styles.username}>{user?.username || user?.full_name || "Player"}</Text>
            </View>
            <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
              <MaterialCommunityIcons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Module Grid */}
        <View style={styles.modulesContainer}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleCard, { borderLeftColor: module.color }]}
              onPress={() => handleModulePress(module.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: module.color }]}>
                <MaterialCommunityIcons
                  name={module.icon}
                  size={32}
                  color="white"
                />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Matches Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8.5</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statLabel}>Pass Acc</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  createPostButton: {
    backgroundColor: "#FF6B6B",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modulesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 12,
    color: "#999",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
