import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AICoachScreen() {
  const coachingData = {
    strengths: [
      { title: 'Speed & Agility', value: '92%', icon: 'lightning-bolt' },
      { title: 'Passing Accuracy', value: '91%', icon: 'target' },
      { title: 'Decision Making', value: '85%', icon: 'brain' },
    ],
    weaknesses: [
      { title: 'Finishing', improvement: 'Improve shot accuracy by 15%', icon: 'target-variant' },
      { title: 'Stamina', improvement: 'Build endurance with 20-min sprints', icon: 'heart-pulse' },
    ],
    position: 'Midfielder',
    confidence: '94%',
    trainingPlan: [
      {
        day: 'Monday',
        focus: 'Finishing Drills',
        exercises: ['5v5 Possession', '1v1 Finishing', 'Set Piece Practice'],
      },
      {
        day: 'Tuesday',
        focus: 'High-Intensity Training',
        exercises: ['Sprint Intervals', 'Shuttle Runs', 'Agility Ladder'],
      },
      {
        day: 'Thursday',
        focus: 'Tactical Work',
        exercises: ['Position Awareness', 'Off-Ball Movement', 'Transition Play'],
      },
      {
        day: 'Friday',
        focus: 'Game Preparation',
        exercises: ['Full Match Simulation', 'Set Plays', 'Recovery Focus'],
      },
    ],
    motivation: 'You\'re on an upward trajectory! Your speed stats have improved 12% this month. Keep pushing on finishing drills and you\'ll break into the elite tier.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Coach</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Position Recommendation */}
        <View style={styles.positionCard}>
          <View style={styles.positionContent}>
            <Text style={styles.positionLabel}>Recommended Position</Text>
            <Text style={styles.position}>{coachingData.position}</Text>
            <Text style={styles.confidence}>Match Confidence: {coachingData.confidence}</Text>
          </View>
          <View style={styles.positionIcon}>
            <MaterialCommunityIcons name="soccer-field" size={48} color="#95E1D3" />
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          <View style={styles.strengthsList}>
            {coachingData.strengths.map((strength, idx) => (
              <View key={idx} style={styles.strengthCard}>
                <View style={[styles.strengthIcon, { backgroundColor: '#D4F1ED' }]}>
                  <MaterialCommunityIcons name={strength.icon} size={24} color="#4ECDC4" />
                </View>
                <View style={styles.strengthInfo}>
                  <Text style={styles.strengthTitle}>{strength.title}</Text>
                </View>
                <Text style={styles.strengthValue}>{strength.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weaknesses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          <View style={styles.weaknessList}>
            {coachingData.weaknesses.map((weakness, idx) => (
              <View key={idx} style={styles.weaknessCard}>
                <View style={[styles.weaknessIcon, { backgroundColor: '#FFE9E9' }]}>
                  <MaterialCommunityIcons name={weakness.icon} size={24} color="#F38181" />
                </View>
                <View style={styles.weaknessInfo}>
                  <Text style={styles.weaknessTitle}>{weakness.title}</Text>
                  <Text style={styles.weaknessDesc}>{weakness.improvement}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Training Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Training Plan</Text>
          {coachingData.trainingPlan.map((session, idx) => (
            <View key={idx} style={styles.trainingCard}>
              <View style={styles.trainingHeader}>
                <Text style={styles.trainingDay}>{session.day}</Text>
                <View style={styles.focusBadge}>
                  <Text style={styles.focusText}>{session.focus}</Text>
                </View>
              </View>
              <View style={styles.exercisesList}>
                {session.exercises.map((exercise, exIdx) => (
                  <View key={exIdx} style={styles.exerciseItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#4ECDC4" />
                    <Text style={styles.exerciseName}>{exercise}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Motivation */}
        <View style={styles.motivationSection}>
          <View style={styles.motivationCard}>
            <MaterialCommunityIcons name="lightbulb" size={32} color="#FFB84D" />
            <Text style={styles.motivationTitle}>Coach's Insight</Text>
            <Text style={styles.motivationText}>{coachingData.motivation}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.btn, styles.saveBtn]}>
            <MaterialCommunityIcons name="bookmark" size={20} color="white" />
            <Text style={styles.btnText}>Save Achievement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.shareBtn]}>
            <MaterialCommunityIcons name="share-variant" size={20} color="white" />
            <Text style={styles.btnText}>Share Progress</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  positionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  positionContent: {
    flex: 1,
  },
  positionLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  position: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  confidence: {
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  positionIcon: {
    marginLeft: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  strengthsList: {
    gap: 10,
  },
  strengthCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  strengthIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  strengthInfo: {
    flex: 1,
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  strengthValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4ECDC4",
  },
  weaknessList: {
    gap: 10,
  },
  weaknessCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  weaknessIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  weaknessInfo: {
    flex: 1,
  },
  weaknessTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  weaknessDesc: {
    fontSize: 12,
    color: "#666",
  },
  trainingCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  trainingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  trainingDay: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  focusBadge: {
    backgroundColor: "#95E1D3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  focusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
  },
  exercisesList: {
    gap: 6,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exerciseName: {
    fontSize: 13,
    color: "#333",
  },
  motivationSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  motivationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveBtn: {
    backgroundColor: "#4ECDC4",
  },
  shareBtn: {
    backgroundColor: "#95E1D3",
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});
