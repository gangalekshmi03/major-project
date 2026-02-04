import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Screen = 'menu' | 'input' | 'dashboard';

interface Recommendation {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export default function WellnessScreen() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState('');
  const [calories, setCalories] = useState('');

  const [wellnessData, setWellnessData] = useState({
    water: 1.5,
    sleep: 6.5,
    calories: 1800,
  });

  const handleLogData = () => {
    if (!water && !sleep && !calories) {
      Alert.alert('Error', 'Please enter at least one metric');
      return;
    }

    setWellnessData({
      water: water ? parseFloat(water) : wellnessData.water,
      sleep: sleep ? parseFloat(sleep) : wellnessData.sleep,
      calories: calories ? parseInt(calories) : wellnessData.calories,
    });

    Alert.alert('Success', 'Data logged successfully!');
    setWater('');
    setSleep('');
    setCalories('');
    setScreen('dashboard');
  };

  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (wellnessData.water < 2) {
      recommendations.push({
        icon: 'water-outline',
        title: 'Increase Hydration',
        desc: `You need ${(2 - wellnessData.water).toFixed(1)}L more water today`,
        color: '#4ECDC4',
      });
    }

    if (wellnessData.sleep < 7) {
      recommendations.push({
        icon: 'moon-waning-crescent',
        title: 'Improve Sleep',
        desc: `Aim for ${(7 - wellnessData.sleep).toFixed(1)} more hours tonight`,
        color: '#95E1D3',
      });
    }

    if (wellnessData.calories < 2000) {
      recommendations.push({
        icon: 'apple',
        title: 'Boost Nutrition',
        desc: `Consume ${2000 - wellnessData.calories} more calories for energy`,
        color: '#F38181',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: 'check-circle-outline',
        title: 'Great Job!',
        desc: 'Your wellness metrics are optimal',
        color: '#4ECDC4',
      });
    }

    return recommendations;
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'menu' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Wellness Tracking</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Track Your Health</Text>
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('input')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4ECDC4' }]}>
              <MaterialCommunityIcons name="plus-circle" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Log Data</Text>
              <Text style={styles.actionDesc}>Add water, sleep & nutrition</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setScreen('dashboard')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#95E1D3' }]}>
              <MaterialCommunityIcons name="chart-box" size={32} color="white" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Dashboard</Text>
              <Text style={styles.actionDesc}>See today's summary & recommendations</Text>
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
            <Text style={styles.title}>Log Data</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="water" size={20} color="#4ECDC4" />
                <Text style={styles.label}>Water Intake (liters)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2.5"
                keyboardType="decimal-pad"
                value={water}
                onChangeText={setWater}
              />
              <Text style={styles.hint}>Daily target: 2-3 liters</Text>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="sleep" size={20} color="#95E1D3" />
                <Text style={styles.label}>Sleep (hours)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8"
                keyboardType="decimal-pad"
                value={sleep}
                onChangeText={setSleep}
              />
              <Text style={styles.hint}>Daily target: 7-8 hours</Text>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="food-apple" size={20} color="#F38181" />
                <Text style={styles.label}>Calories (kcal)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2000"
                keyboardType="number-pad"
                value={calories}
                onChangeText={setCalories}
              />
              <Text style={styles.hint}>Daily target: 1800-2500 kcal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogData}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <Text style={styles.submitBtnText}>Log Data</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('menu')}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Wellness Dashboard</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.dashboardHeader}>
            <Text style={styles.date}>Today</Text>
            <View style={styles.dateBar} />
          </View>

          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Daily Summary</Text>
            <View style={styles.metricsList}>
              <View style={[styles.metricItem, { borderLeftColor: '#4ECDC4' }]}>
                <View style={[styles.metricIcon, { backgroundColor: '#E0F9F7' }]}>
                  <MaterialCommunityIcons name="water" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.metricDetails}>
                  <Text style={styles.metricLabel}>Hydration</Text>
                  <Text style={styles.metricValue}>{wellnessData.water}L</Text>
                </View>
                <Text style={styles.metricStatus}>
                  {wellnessData.water >= 2 ? '✓' : wellnessData.water >= 1.5 ? '~' : '!'}
                </Text>
              </View>

              <View style={[styles.metricItem, { borderLeftColor: '#95E1D3' }]}>
                <View style={[styles.metricIcon, { backgroundColor: '#E8FFFA' }]}>
                  <MaterialCommunityIcons name="sleep" size={24} color="#95E1D3" />
                </View>
                <View style={styles.metricDetails}>
                  <Text style={styles.metricLabel}>Sleep</Text>
                  <Text style={styles.metricValue}>{wellnessData.sleep}h</Text>
                </View>
                <Text style={styles.metricStatus}>
                  {wellnessData.sleep >= 7 ? '✓' : wellnessData.sleep >= 6 ? '~' : '!'}
                </Text>
              </View>

              <View style={[styles.metricItem, { borderLeftColor: '#F38181' }]}>
                <View style={[styles.metricIcon, { backgroundColor: '#FFE9E9' }]}>
                  <MaterialCommunityIcons name="food-apple" size={24} color="#F38181" />
                </View>
                <View style={styles.metricDetails}>
                  <Text style={styles.metricLabel}>Nutrition</Text>
                  <Text style={styles.metricValue}>{wellnessData.calories} kcal</Text>
                </View>
                <Text style={styles.metricStatus}>
                  {wellnessData.calories >= 2000 ? '✓' : wellnessData.calories >= 1800 ? '~' : '!'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {getRecommendations().map((rec, idx) => (
              <View key={idx} style={[styles.recCard, { borderLeftColor: rec.color }]}>
                <View style={[styles.recIcon, { backgroundColor: rec.color }]}>
                  <MaterialCommunityIcons name={rec.icon as any} size={24} color="white" />
                </View>
                <View style={styles.recContent}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDesc}>{rec.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.chartPlaceholder}>
              <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
              <Text style={styles.chartText}>Progress charts coming soon</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logMoreBtn}
            onPress={() => setScreen('input')}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.logMoreBtnText}>Log More Data</Text>
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    paddingHorizontal: 4,
  },
  submitBtn: {
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
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  dashboardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  dateBar: {
    height: 4,
    backgroundColor: "#4ECDC4",
    borderRadius: 2,
    width: 40,
  },
  metricsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  metricsList: {
    gap: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metricDetails: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  metricStatus: {
    fontSize: 20,
    fontWeight: "700",
  },
  recommendationSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  recCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  recDesc: {
    fontSize: 12,
    color: "#666",
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chartPlaceholder: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  logMoreBtn: {
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
  logMoreBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
