import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/useAuth";
import { router } from "expo-router";

export default function Index() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {user ? `Welcome ${user.username}` : "Not Logged In"}
      </Text>

      {!user ? (
        <Button title="Go to Login" onPress={() => router.push("/(auth)/login")} />
      ) : (
        <Button title="Logout" onPress={logout} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, marginBottom: 20 },
});
