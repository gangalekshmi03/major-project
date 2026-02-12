import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getCurrentUser, updateProfile } from "@/api/users";

type HistoryEntry = {
  value: number;
  recorded_at: string;
};

type UserProfile = {
  username?: string;
  full_name?: string;
  email?: string;
  bio?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  height_history?: HistoryEntry[];
  weight_history?: HistoryEntry[];
};

const GENDER_OPTIONS = ["male", "female", "other"];

export default function ProfileDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getCurrentUser();
        const user: UserProfile | undefined = res?.user;
        if (user) {
          setProfile(user);
          setFullName(user.full_name || "");
          setUsername(user.username || "");
          setBio(user.bio || "");
          setAge(user.age !== undefined ? String(user.age) : "");
          setGender(user.gender || "");
          setHeightCm(user.height_cm !== undefined ? String(user.height_cm) : "");
          setWeightKg(user.weight_kg !== undefined ? String(user.weight_kg) : "");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!age || !gender) {
      Alert.alert("Missing Info", "Please provide age and gender.");
      return;
    }

    const parsedAge = Number(age);
    const parsedHeight = heightCm ? Number(heightCm) : undefined;
    const parsedWeight = weightKg ? Number(weightKg) : undefined;

    if (Number.isNaN(parsedAge) || parsedAge <= 0) {
      Alert.alert("Invalid Age", "Please enter a valid age.");
      return;
    }
    if (parsedHeight !== undefined && (Number.isNaN(parsedHeight) || parsedHeight <= 0)) {
      Alert.alert("Invalid Height", "Please enter a valid height in cm.");
      return;
    }
    if (parsedWeight !== undefined && (Number.isNaN(parsedWeight) || parsedWeight <= 0)) {
      Alert.alert("Invalid Weight", "Please enter a valid weight in kg.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName || undefined,
        username: username || undefined,
        bio: bio || undefined,
        age: parsedAge,
        gender,
        height_cm: parsedHeight,
        weight_kg: parsedWeight,
      });
      Alert.alert("Saved", "Profile details updated.");
      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || "Failed to update profile";
      Alert.alert("Update Failed", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.readOnly]} value={profile.email || ""} editable={false} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, styles.multiline]} value={bio} onChangeText={setBio} multiline />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Profile</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="e.g., 22"
            />
          </View>

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.genderChip, gender === opt && styles.genderChipActive]}
                onPress={() => setGender(opt)}
              >
                <Text style={[styles.genderText, gender === opt && styles.genderTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
              placeholder="e.g., 175"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="e.g., 68"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Data</Text>
          <View style={styles.savedRow}>
            <Text style={styles.savedLabel}>Age</Text>
            <Text style={styles.savedValue}>{profile.age ?? "—"}</Text>
          </View>
          <View style={styles.savedRow}>
            <Text style={styles.savedLabel}>Gender</Text>
            <Text style={styles.savedValue}>{profile.gender ?? "—"}</Text>
          </View>
          <View style={styles.savedRow}>
            <Text style={styles.savedLabel}>Height</Text>
            <Text style={styles.savedValue}>{profile.height_cm ? `${profile.height_cm} cm` : "—"}</Text>
          </View>
          <View style={styles.savedRow}>
            <Text style={styles.savedLabel}>Weight</Text>
            <Text style={styles.savedValue}>{profile.weight_kg ? `${profile.weight_kg} kg` : "—"}</Text>
          </View>
          {!!profile.height_history?.length && (
            <View style={styles.historyBlock}>
              <Text style={styles.historyTitle}>Height History (latest)</Text>
              {profile.height_history.slice(-5).reverse().map((h, idx) => (
                <Text key={`h-${idx}`} style={styles.historyItem}>
                  {h.value} cm · {new Date(h.recorded_at).toLocaleDateString()}
                </Text>
              ))}
            </View>
          )}
          {!!profile.weight_history?.length && (
            <View style={styles.historyBlock}>
              <Text style={styles.historyTitle}>Weight History (latest)</Text>
              {profile.weight_history.slice(-5).reverse().map((w, idx) => (
                <Text key={`w-${idx}`} style={styles.historyItem}>
                  {w.value} kg · {new Date(w.recorded_at).toLocaleDateString()}
                </Text>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color="white" />
              <Text style={styles.saveText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "white",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#222",
  },
  readOnly: {
    color: "#999",
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  genderChipActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  genderText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  genderTextActive: {
    color: "white",
  },
  savedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  savedLabel: {
    color: "#666",
    fontSize: 13,
  },
  savedValue: {
    color: "#000",
    fontSize: 13,
    fontWeight: "600",
  },
  historyBlock: {
    marginTop: 12,
  },
  historyTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  historyItem: {
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
  },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
