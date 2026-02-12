import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser } from "@/api/users";
import { logWellnessData } from "@/api/wellness";
import {
  ActivityLevel,
  Goal,
  TrainingIntensity,
  getBmi,
  getCalorie,
  getIdealWeight,
  getSleep,
  getWater,
} from "@/api/health";
import * as ImagePicker from "expo-image-picker";

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
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>("moderate");
  const [profileMissing, setProfileMissing] = useState(false);

  const [wellnessData, setWellnessData] = useState({
    water: 1.5,
    sleep: 6.5,
    calories: 1800,
  });

  const [healthInsights, setHealthInsights] = useState<{
    bmi?: number;
    bmi_category?: string;
    ideal_weight_kg?: number;
    daily_calories?: number;
    water_intake_liters?: number;
    recommended_sleep_hours?: number;
  }>({});
  const [recoveryInput, setRecoveryInput] = useState({
    training_intensity: "moderate" as TrainingIntensity,
    sleep_hours: "7",
    muscle_soreness: "moderate" as "low" | "moderate" | "high",
  });
  const [matchFitnessInput, setMatchFitnessInput] = useState({
    distance_km: "8",
    sprints: "20",
    fatigue_level: "moderate" as "low" | "moderate" | "high",
  });
  const [trainingLoadInput, setTrainingLoadInput] = useState({
    session_duration_min: "60",
    intensity: "moderate" as TrainingIntensity,
    rpe: "6",
  });
  const [dietInput, setDietInput] = useState({
    intensity: "moderate" as TrainingIntensity,
    goal: "maintain" as Goal,
    day: "training" as "training" | "rest",
    position: "mid",
  });

  const [recoveryResult, setRecoveryResult] = useState<any>(null);
  const [matchFitnessResult, setMatchFitnessResult] = useState<any>(null);
  const [trainingLoadResult, setTrainingLoadResult] = useState<any>(null);
  const [dietResult, setDietResult] = useState<any>(null);
  const [foodImageUri, setFoodImageUri] = useState<string>("");
  const [foodImageBase64, setFoodImageBase64] = useState<string>("");
  const [foodPrediction, setFoodPrediction] = useState<{ predicted_class?: string; confidence?: number } | null>(null);
  const getErrorMessage = (error: any) => {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed"
    );
  };
  const asNumber = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (typeof value === "string") {
      const match = value.match(/-?\d+(\.\d+)?/);
      if (!match) return undefined;
      const num = Number(match[0]);
      return Number.isFinite(num) ? num : undefined;
    }
    return undefined;
  };
  const computeFallbackInsights = (user: any) => {
    const age = asNumber(user?.age);
    const heightCm = asNumber(user?.height_cm);
    const weightKg = asNumber(user?.weight_kg);
    const gender = String(user?.gender || "").toLowerCase();

    let bmi: number | undefined;
    if (heightCm && weightKg) {
      const h = heightCm / 100;
      bmi = Number((weightKg / (h * h)).toFixed(2));
    }

    let idealWeight: number | undefined;
    if (heightCm) {
      idealWeight = gender === "male"
        ? Number((50 + 0.9 * (heightCm - 152)).toFixed(2))
        : Number((45.5 + 0.9 * (heightCm - 152)).toFixed(2));
    }

    let waterTarget: number | undefined;
    if (weightKg) {
      const extra = activityLevel === "low" ? 0.2 : activityLevel === "high" ? 0.8 : 0.5;
      waterTarget = Number((weightKg * 0.033 + extra).toFixed(2));
    }

    let sleepTarget: number | undefined;
    if (age !== undefined) {
      if (age <= 13) sleepTarget = 10;
      else if (age <= 17) sleepTarget = 9;
      else if (age <= 64) sleepTarget = 8;
      else sleepTarget = 7.5;
      if (trainingIntensity === "high") sleepTarget += 0.5;
      sleepTarget = Number(sleepTarget.toFixed(1));
    }

    let dailyCalories: number | undefined;
    if (age && heightCm && weightKg && (gender === "male" || gender === "female")) {
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
      const factor = activityLevel === "low" ? 1.2 : activityLevel === "high" ? 1.8 : 1.55;
      let value = bmr * factor;
      if (goal === "lose") value -= 300;
      if (goal === "gain") value += 300;
      dailyCalories = Math.round(value);
    }

    return {
      bmi,
      idealWeight,
      waterTarget,
      sleepTarget,
      dailyCalories,
    };
  };

  const handleLogData = async () => {
    if (!water && !sleep && !calories) {
      Alert.alert('Error', 'Please enter at least one metric');
      return;
    }

    const next = {
      water: water ? parseFloat(water) : wellnessData.water,
      sleep: sleep ? parseFloat(sleep) : wellnessData.sleep,
      calories: calories ? parseInt(calories) : wellnessData.calories,
    };
    setWellnessData(next);

    try {
      await logWellnessData({
        water: next.water,
        sleep: next.sleep,
        calories: next.calories,
      });
    } catch (error) {
      console.log("logWellnessData error", error);
      Alert.alert("Error", String(getErrorMessage(error)));
    }

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

  const fetchHealthInsights = async () => {
    try {
      const res = await getCurrentUser();
      const user = res?.user;
      if (!user?.age || !user?.gender || !user?.height_cm || !user?.weight_kg) {
        setProfileMissing(true);
        return;
      }
      setProfileMissing(false);

      const results = await Promise.allSettled([
        getBmi({ height_cm: user.height_cm, weight_kg: user.weight_kg }),
        getIdealWeight({ height_cm: user.height_cm, gender: user.gender }),
        getWater({ weight_kg: user.weight_kg, activity_level: activityLevel }),
        getSleep({ age: user.age, training_intensity: trainingIntensity }),
        getCalorie({
          age: user.age,
          gender: user.gender,
          height_cm: user.height_cm,
          weight_kg: user.weight_kg,
          activity_level: activityLevel,
          goal,
        }),
      ]);

      const bmiRes = results[0].status === "fulfilled" ? results[0].value : null;
      const idealRes = results[1].status === "fulfilled" ? results[1].value : null;
      const waterRes = results[2].status === "fulfilled" ? results[2].value : null;
      const sleepRes = results[3].status === "fulfilled" ? results[3].value : null;
      const calorieRes = results[4].status === "fulfilled" ? results[4].value : null;
      const fallback = computeFallbackInsights(user);

      setHealthInsights({
        bmi: asNumber(bmiRes?.bmi ?? bmiRes?.bmi_value ?? bmiRes?.body_mass_index) ?? fallback.bmi,
        bmi_category: bmiRes?.category ?? bmiRes?.bmi_category,
        ideal_weight_kg: asNumber(
          idealRes?.ideal_weight_kg ??
          idealRes?.ideal_weight ??
          idealRes?.ideal ??
          idealRes?.your_ideal_weight
        ) ?? fallback.idealWeight,
        water_intake_liters: asNumber(
          waterRes?.water_intake_liters ??
          waterRes?.water_needed_l ??
          waterRes?.water_needed ??
          waterRes?.daily_water_liters
        ) ?? fallback.waterTarget,
        recommended_sleep_hours: asNumber(
          sleepRes?.recommended_sleep_hours ??
          sleepRes?.sleep_hours ??
          sleepRes?.hours
        ) ?? fallback.sleepTarget,
        daily_calories: asNumber(
          calorieRes?.daily_calories ??
          calorieRes?.calories ??
          calorieRes?.body_calories ??
          calorieRes?.daily_calories_needed
        ) ?? fallback.dailyCalories,
      });
    } catch (error) {
      console.log("fetchHealthInsights error", error);
      Alert.alert("Error", String(getErrorMessage(error)));
    }
  };

  const runRecovery = async () => {
    try {
      const res = await (await import("@/api/health")).getRecovery({
        training_intensity: recoveryInput.training_intensity,
        sleep_hours: Number(recoveryInput.sleep_hours),
        muscle_soreness: recoveryInput.muscle_soreness,
      });
      setRecoveryResult(res);
    } catch (error) {
      console.log("runRecovery error", error);
      Alert.alert("Error", "Failed to fetch recovery recommendation");
    }
  };

  const runMatchFitness = async () => {
    try {
      const res = await (await import("@/api/health")).getMatchFitness({
        distance_km: Number(matchFitnessInput.distance_km),
        sprints: Number(matchFitnessInput.sprints),
        fatigue_level: matchFitnessInput.fatigue_level,
      });
      setMatchFitnessResult(res);
    } catch (error) {
      console.log("runMatchFitness error", error);
      Alert.alert("Error", "Failed to fetch match fitness");
    }
  };

  const runTrainingLoad = async () => {
    try {
      const res = await (await import("@/api/health")).getTrainingLoad({
        session_duration_min: Number(trainingLoadInput.session_duration_min),
        intensity: trainingLoadInput.intensity,
        rpe: Number(trainingLoadInput.rpe),
      });
      setTrainingLoadResult(res);
    } catch (error) {
      console.log("runTrainingLoad error", error);
      Alert.alert("Error", "Failed to fetch training load");
    }
  };

  const runDiet = async () => {
    try {
      const res = await getCurrentUser();
      const user = res?.user;
      if (!user?.age || !user?.gender || !user?.height_cm || !user?.weight_kg) {
        Alert.alert("Missing Profile", "Please update your profile details first.");
        return;
      }
      const api = await import("@/api/health");
      const out = await api.getDiet({
        age: user.age,
        gender: user.gender,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        intensity: dietInput.intensity,
        goal: dietInput.goal,
        day: dietInput.day,
        position: dietInput.position,
      });
      setDietResult(out);
    } catch (error) {
      console.log("runDiet error", error);
      Alert.alert("Error", "Failed to fetch diet plan");
    }
  };

  const pickFoodImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setFoodImageUri(asset.uri);
        setFoodImageBase64(asset.base64 || "");
        setFoodPrediction(null);
      }
    } catch (error) {
      console.log("pickFoodImage error", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const runFoodPredict = async () => {
    console.log("runFoodPredict clicked", foodImageUri);
    if (!foodImageUri) {
      Alert.alert("Missing Image", "Please select a food image first.");
      return;
    }
    if (!foodImageBase64) {
      Alert.alert("Error", "Image encoding failed. Please pick the image again.");
      return;
    }
    try {
      const api = await import("@/api/health");
      const res = await api.predictImage({ image_base64: foodImageBase64 });
      setFoodPrediction(res);
    } catch (error) {
      console.log("runFoodPredict error", error);
      Alert.alert("Error", String(getErrorMessage(error)));
    }
  };

  const renderResultFields = (result: any) => {
    if (!result || typeof result !== "object") return null;
    const entries: Array<[string, any]> = [];
    const flatten = (obj: any, prefix = "") => {
      if (!obj || typeof obj !== "object") return;
      Object.entries(obj).forEach(([k, v]) => {
        const nextKey = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
          flatten(v, nextKey);
        } else {
          entries.push([nextKey, v]);
        }
      });
    };
    flatten(result);

    return entries.map(([key, value]) => {
      let displayValue: string;
      if (value === null || value === undefined) {
        displayValue = "-";
      } else if (Array.isArray(value)) {
        displayValue = value.join(", ");
      } else {
        displayValue = String(value);
      }
      return (
        <View key={key} style={styles.resultRow}>
          <Text style={styles.resultKey}>{key}</Text>
          <Text style={styles.resultValue}>{displayValue}</Text>
        </View>
      );
    });
  };

  useEffect(() => {
    if (screen === "dashboard") {
      fetchHealthInsights();
    }
  }, [screen, activityLevel, goal, trainingIntensity]);

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

          <View style={styles.healthSection}>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            {profileMissing ? (
              <View style={styles.healthNotice}>
                <Text style={styles.healthNoticeText}>
                  Add age, gender, height, and weight in Profile Details to see insights.
                </Text>
                <TouchableOpacity
                  style={styles.healthCta}
                  onPress={() => router.push("/(modules)/profile-details" as any)}
                >
                  <Text style={styles.healthCtaText}>Update Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.preferenceRow}>
                  <Text style={styles.prefLabel}>Activity</Text>
                  <View style={styles.prefChips}>
                    {(["low", "moderate", "high"] as ActivityLevel[]).map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.prefChip, activityLevel === lvl && styles.prefChipActive]}
                        onPress={() => setActivityLevel(lvl)}
                      >
                        <Text style={[styles.prefChipText, activityLevel === lvl && styles.prefChipTextActive]}>
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.prefLabel}>Goal</Text>
                  <View style={styles.prefChips}>
                    {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.prefChip, goal === g && styles.prefChipActive]}
                        onPress={() => setGoal(g)}
                      >
                        <Text style={[styles.prefChipText, goal === g && styles.prefChipTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.prefLabel}>Training</Text>
                  <View style={styles.prefChips}>
                    {(["low", "moderate", "high"] as TrainingIntensity[]).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.prefChip, trainingIntensity === t && styles.prefChipActive]}
                        onPress={() => setTrainingIntensity(t)}
                      >
                        <Text style={[styles.prefChipText, trainingIntensity === t && styles.prefChipTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.healthGrid}>
                  <View style={styles.healthCard}>
                    <Text style={styles.healthLabel}>BMI</Text>
                    <Text style={styles.healthValue}>{healthInsights.bmi ?? "—"}</Text>
                    <Text style={styles.healthSub}>{healthInsights.bmi_category ?? "—"}</Text>
                  </View>
                  <View style={styles.healthCard}>
                    <Text style={styles.healthLabel}>Ideal Weight</Text>
                    <Text style={styles.healthValue}>
                      {healthInsights.ideal_weight_kg ? `${healthInsights.ideal_weight_kg} kg` : "—"}
                    </Text>
                    <Text style={styles.healthSub}>Based on height</Text>
                  </View>
                  <View style={styles.healthCard}>
                    <Text style={styles.healthLabel}>Water Target</Text>
                    <Text style={styles.healthValue}>
                      {healthInsights.water_intake_liters ? `${healthInsights.water_intake_liters} L` : "—"}
                    </Text>
                    <Text style={styles.healthSub}>Daily intake</Text>
                  </View>
                  <View style={styles.healthCard}>
                    <Text style={styles.healthLabel}>Sleep Target</Text>
                    <Text style={styles.healthValue}>
                      {healthInsights.recommended_sleep_hours ? `${healthInsights.recommended_sleep_hours} h` : "—"}
                    </Text>
                    <Text style={styles.healthSub}>Recommended</Text>
                  </View>
                  <View style={styles.healthCardFull}>
                    <Text style={styles.healthLabel}>Daily Calories</Text>
                    <Text style={styles.healthValue}>
                      {healthInsights.daily_calories ? `${healthInsights.daily_calories} kcal` : "—"}
                    </Text>
                    <Text style={styles.healthSub}>Based on profile</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.chartPlaceholder}>
              <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
              <Text style={styles.chartText}>Progress charts coming soon</Text>
            </View>
          </View>

          <View style={styles.healthSection}>
            <Text style={styles.sectionTitle}>Advanced Health Tools</Text>

            <View style={styles.toolCard}>
              <Text style={styles.toolTitle}>Recovery Check</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={recoveryInput.sleep_hours}
                  onChangeText={(v) => setRecoveryInput({ ...recoveryInput, sleep_hours: v })}
                  keyboardType="decimal-pad"
                  placeholder="Sleep hours"
                />
                <TouchableOpacity
                  style={styles.smallChip}
                  onPress={() =>
                    setRecoveryInput({ ...recoveryInput, muscle_soreness: "low" })
                  }
                >
                  <Text style={styles.smallChipText}>Low</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallChip}
                  onPress={() =>
                    setRecoveryInput({ ...recoveryInput, muscle_soreness: "moderate" })
                  }
                >
                  <Text style={styles.smallChipText}>Moderate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallChip}
                  onPress={() =>
                    setRecoveryInput({ ...recoveryInput, muscle_soreness: "high" })
                  }
                >
                  <Text style={styles.smallChipText}>High</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.toolBtn} onPress={runRecovery}>
                <Text style={styles.toolBtnText}>Get Recovery</Text>
              </TouchableOpacity>
              {recoveryResult && (
                <View style={styles.resultBlock}>{renderResultFields(recoveryResult)}</View>
              )}
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolTitle}>Match Fitness</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={matchFitnessInput.distance_km}
                  onChangeText={(v) => setMatchFitnessInput({ ...matchFitnessInput, distance_km: v })}
                  keyboardType="decimal-pad"
                  placeholder="Distance km"
                />
                <TextInput
                  style={styles.inlineInput}
                  value={matchFitnessInput.sprints}
                  onChangeText={(v) => setMatchFitnessInput({ ...matchFitnessInput, sprints: v })}
                  keyboardType="number-pad"
                  placeholder="Sprints"
                />
              </View>
              <TouchableOpacity style={styles.toolBtn} onPress={runMatchFitness}>
                <Text style={styles.toolBtnText}>Get Fitness</Text>
              </TouchableOpacity>
              {matchFitnessResult && (
                <View style={styles.resultBlock}>{renderResultFields(matchFitnessResult)}</View>
              )}
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolTitle}>Training Load</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={trainingLoadInput.session_duration_min}
                  onChangeText={(v) => setTrainingLoadInput({ ...trainingLoadInput, session_duration_min: v })}
                  keyboardType="number-pad"
                  placeholder="Minutes"
                />
                <TextInput
                  style={styles.inlineInput}
                  value={trainingLoadInput.rpe}
                  onChangeText={(v) => setTrainingLoadInput({ ...trainingLoadInput, rpe: v })}
                  keyboardType="number-pad"
                  placeholder="RPE"
                />
              </View>
              <TouchableOpacity style={styles.toolBtn} onPress={runTrainingLoad}>
                <Text style={styles.toolBtnText}>Get Load</Text>
              </TouchableOpacity>
              {trainingLoadResult && (
                <View style={styles.resultBlock}>{renderResultFields(trainingLoadResult)}</View>
              )}
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolTitle}>Diet Plan</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={dietInput.position}
                  onChangeText={(v) => setDietInput({ ...dietInput, position: v })}
                  placeholder="Position"
                />
              </View>
              <TouchableOpacity style={styles.toolBtn} onPress={runDiet}>
                <Text style={styles.toolBtnText}>Get Diet</Text>
              </TouchableOpacity>
              {dietResult && (
                <View style={styles.resultBlock}>{renderResultFields(dietResult)}</View>
              )}
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolTitle}>Food Image Classifier</Text>
              {foodImageUri ? (
                <Image source={{ uri: foodImageUri }} style={styles.foodImage} />
              ) : (
                <View style={styles.foodPlaceholder}>
                  <MaterialCommunityIcons name="image-outline" size={28} color="#999" />
                  <Text style={styles.foodPlaceholderText}>No image selected</Text>
                </View>
              )}
              <View style={styles.inlineRow}>
                <TouchableOpacity style={styles.smallBtn} onPress={pickFoodImage}>
                  <Text style={styles.smallBtnText}>Pick Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallBtnPrimary} onPress={runFoodPredict}>
                  <Text style={styles.smallBtnPrimaryText}>Predict</Text>
                </TouchableOpacity>
              </View>
              {foodPrediction && (
                <View style={styles.resultBlock}>{renderResultFields(foodPrediction)}</View>
              )}
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
  healthSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  healthNotice: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  healthNoticeText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  healthCta: {
    alignSelf: "flex-start",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  healthCtaText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  preferenceRow: {
    marginBottom: 12,
  },
  prefLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  prefChips: {
    flexDirection: "row",
    gap: 8,
  },
  prefChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "white",
  },
  prefChipActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  prefChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  prefChipTextActive: {
    color: "white",
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  toolCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  inlineInput: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 110,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  smallChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  toolBtn: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toolBtnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  resultText: {
    marginTop: 8,
    fontSize: 12,
    color: "#333",
  },
  resultBlock: {
    marginTop: 8,
    gap: 6,
  },
  resultRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  resultKey: {
    fontSize: 11,
    color: "#999",
    textTransform: "capitalize",
  },
  resultValue: {
    marginTop: 2,
    fontSize: 12,
    color: "#333",
    flexShrink: 1,
  },
  foodImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodPlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 6,
  },
  foodPlaceholderText: {
    fontSize: 12,
    color: "#999",
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  smallBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  smallBtnPrimary: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  smallBtnPrimaryText: {
    fontSize: 12,
    color: "white",
    fontWeight: "700",
  },
  healthCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  healthCardFull: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  healthLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  healthValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  healthSub: {
    fontSize: 11,
    color: "#666",
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

