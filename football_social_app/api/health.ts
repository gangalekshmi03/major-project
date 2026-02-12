import API from "./client";

export type ActivityLevel = "low" | "moderate" | "high";
export type Goal = "lose" | "maintain" | "gain";
export type TrainingIntensity = "low" | "moderate" | "high";

export const getCalorie = async (data: {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
}) => {
  const res = await API.post("/health/calorie", data);
  return res.data;
};

export const getBmi = async (data: { height_cm: number; weight_kg: number }) => {
  const res = await API.post("/health/bmi", data);
  return res.data;
};

export const getWater = async (data: { weight_kg: number; activity_level: ActivityLevel }) => {
  const res = await API.post("/health/water", data);
  return res.data;
};

export const getIdealWeight = async (data: { height_cm: number; gender: string }) => {
  const res = await API.post("/health/ideal_weight", data);
  return res.data;
};

export const getRecovery = async (data: {
  training_intensity: TrainingIntensity;
  sleep_hours: number;
  muscle_soreness: "low" | "moderate" | "high";
}) => {
  const res = await API.post("/health/recovery", data);
  return res.data;
};

export const getSleep = async (data: { age: number; training_intensity: TrainingIntensity }) => {
  const res = await API.post("/health/sleep", data);
  return res.data;
};

export const getMatchFitness = async (data: {
  distance_km: number;
  sprints: number;
  fatigue_level: "low" | "moderate" | "high";
}) => {
  const res = await API.post("/health/match_fitness", data);
  return res.data;
};

export const getTrainingLoad = async (data: {
  session_duration_min: number;
  intensity: TrainingIntensity;
  rpe: number;
}) => {
  const res = await API.post("/health/training_load", data);
  return res.data;
};

export const getDiet = async (data: {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  intensity: TrainingIntensity;
  goal: Goal;
  day: "training" | "rest";
  position: string;
}) => {
  const res = await API.post("/health/diet", data);
  return res.data;
};

export const predictImage = async (data: { image_base64: string }) => {
  const res = await API.post("/health/predict_image_json", data);
  return res.data;
};
