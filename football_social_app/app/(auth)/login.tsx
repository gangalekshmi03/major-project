import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Please try again.";
      Alert.alert("Login Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/(auth)/signup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="soccer"
            size={60}
            color="#FF6B6B"
          />
          <Text style={styles.appTitle}>Football Social</Text>
          <Text style={styles.subtitle}>Connect • Play • Compete</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="login"
                  size={20}
                  color="white"
                />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Forgot Password (future feature) */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotButtonText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>New to Football Social?</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegisterRedirect}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={20}
            color="#FF6B6B"
          />
          <Text style={styles.registerButtonText}>Create New Account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By logging in, you agree to our Terms & Conditions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  passwordToggle: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    elevation: 2,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  forgotButton: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#666",
    fontSize: 13,
  },
  registerButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  registerButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
});
