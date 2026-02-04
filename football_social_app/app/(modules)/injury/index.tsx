import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, FlatList, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Screen = 'menu' | 'input' | 'recovery';

export default function InjuryRecoveryScreen() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [injuryType, setInjuryType] = useState('');
  const [painLevel, setPainLevel] = useState(5);
  const [stage, setStage] = useState('');

  const injuryTypes = ['Muscle Strain', 'Sprain', 'Fracture', 'Tendinitis', 'Contusion', 'Laceration'];
  const stages = ['Acute (0-3 days)', 'Early Recovery (3-7 days)', 'Intermediate (1-2 weeks)', 'Late Stage (2+ weeks)'];

  const handleLogInjury = () => {
    if (!injuryType || !stage) {
      Alert.alert('Error', 'Please select injury type and stage');
      return;
    }
    setScreen('recovery');
  };

  const recoveryPlan = {
    injuryType: injuryType || 'Muscle Strain',
    timeline: '2-3 weeks',
    dos: [
      'Rest the affected area for 48-72 hours',
      'Apply ice for 15-20 minutes, 3-4 times daily',
      'Use compression bandage to reduce swelling',
      'Elevate the injured limb above heart level',
      'Take anti-inflammatory medications (consult doctor)',
      'Perform gentle stretching after initial healing',
      'Gradually return to light activity',
    ],
    donts: [
      'Do not apply heat in the first 72 hours',
      'Avoid strenuous activities or training',
      'Don\'t ignore sharp pain or increased swelling',
      'Avoid alcohol and smoking (slows recovery)',
      'Don\'t play through the pain',
      'Don\'t return to sport too quickly',
    ],
    exercises: [
      {
        phase: 'Phase 1: Rest & Protect',
        days: 'Days 1-3',
        activities: ['Complete rest', 'Ice therapy', 'Elevation'],
      },
      {
        phase: 'Phase 2: Gentle Movement',
        days: 'Days 4-7',
        activities: ['Gentle range of motion exercises', 'Massage around injury', 'Light stretching'],
      },
      {
        phase: 'Phase 3: Strengthening',
        days: 'Week 2-3',
        activities: ['Resistance band exercises', 'Isometric holds', 'Gradual load increase'],
      },
      {
        phase: 'Phase 4: Return to Sport',
        days: 'Week 3+',
        activities: ['Sport-specific drills', 'Full training', 'Competition'],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'menu' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Injury & Recovery</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Track Your Recovery</Text>
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('input')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F38181' }]}>
              <MaterialCommunityIcons name="plus-circle" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Log Injury</Text>
              <Text style={styles.actionDesc}>Record new injury & get recovery plan</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('recovery')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9999' }]}>
              <MaterialCommunityIcons name="bandage" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Recovery Plan</Text>
              <Text style={styles.actionDesc}>Check exercises & dos/donts</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'input' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('menu')}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Log Injury</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Injury Type *</Text>
              <FlatList
                data={injuryTypes}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      injuryType === item && styles.optionSelected,
                    ]}
                    onPress={() => setInjuryType(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        injuryType === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Recovery Stage *</Text>
              <FlatList
                data={stages}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      stage === item && styles.optionSelected,
                    ]}
                    onPress={() => setStage(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        stage === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pain Level: {painLevel}/10</Text>
              <View style={styles.sliderContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.painOption,
                      painLevel === num && styles.painOptionSelected,
                    ]}
                    onPress={() => setPainLevel(num)}
                  >
                    <Text
                      style={[
                        styles.painText,
                        painLevel === num && styles.painTextSelected,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.painLabels}>
                <Text style={styles.painLabel}>No Pain</Text>
                <Text style={styles.painLabel}>Severe</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogInjury}
          >
            <Text style={styles.submitBtnText}>Get Recovery Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'recovery' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('menu')}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Recovery Plan</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.injuryCard}>
            <View style={styles.injuryIconContainer}>
              <MaterialCommunityIcons name="hospital-box" size={40} color="#F38181" />
            </View>
            <Text style={styles.injuryTypeText}>{recoveryPlan.injuryType}</Text>
            <Text style={styles.timelineText}>Expected Recovery: {recoveryPlan.timeline}</Text>
          </View>

          {/* Do's Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Do's</Text>
            </View>
            {recoveryPlan.dos.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.checkIcon}>
                  <MaterialCommunityIcons name="check" size={16} color="white" />
                </View>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Don'ts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Don'ts</Text>
            </View>
            {recoveryPlan.donts.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={[styles.checkIcon, { backgroundColor: '#FF6B6B' }]}>
                  <MaterialCommunityIcons name="close" size={16} color="white" />
                </View>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Rehabilitation Exercises */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#95E1D3" />
              <Text style={styles.sectionTitle}>Rehabilitation Exercises</Text>
            </View>
            {recoveryPlan.exercises.map((phase, idx) => (
              <View key={idx} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseName}>{phase.phase}</Text>
                  <Text style={styles.phaseDays}>{phase.days}</Text>
                </View>
                <View style={styles.activitiesList}>
                  {phase.activities.map((activity, aIdx) => (
                    <View key={aIdx} style={styles.activityItem}>
                      <View style={styles.dot} />
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Wellness Link */}
          <View style={styles.wellnessSection}>
            <View style={styles.wellnessCard}>
              <View style={[styles.wellnessIcon, { backgroundColor: '#E0F9F7' }]}>
                <MaterialCommunityIcons name="heart-pulse" size={32} color="#4ECDC4" />
              </View>
              <View style={styles.wellnessContent}>
                <Text style={styles.wellnessTitle}>Enhance Recovery</Text>
                <Text style={styles.wellnessDesc}>Log your wellness data to optimize recovery</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#4ECDC4" />
            </View>
          </View>

          <TouchableOpacity
            style={styles.linkWellnessBtn}
            onPress={() => router.push('/(modules)/wellness')}
          >
            <MaterialCommunityIcons name="link" size={20} color="white" />
            <Text style={styles.linkBtnText}>Go to Wellness Tracking</Text>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: "#999",
  },
  form: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#F38181",
    borderColor: "#F38181",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "white",
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 8,
  },
  painOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  painOptionSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  painText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  painTextSelected: {
    color: "white",
  },
  painLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  painLabel: {
    fontSize: 11,
    color: "#999",
  },
  submitBtn: {
    backgroundColor: "#F38181",
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  injuryCard: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  injuryIconContainer: {
    marginBottom: 12,
  },
  injuryTypeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  listText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    lineHeight: 18,
  },
  phaseCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#95E1D3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  phaseDays: {
    fontSize: 11,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activitiesList: {
    gap: 6,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#95E1D3",
    marginRight: 10,
  },
  activityText: {
    fontSize: 13,
    color: "#333",
  },
  wellnessSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  wellnessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wellnessIcon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  wellnessContent: {
    flex: 1,
  },
  wellnessTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  wellnessDesc: {
    fontSize: 12,
    color: "#999",
  },
  linkWellnessBtn: {
    backgroundColor: "#4ECDC4",
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  linkBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});
