import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/colors";

export function AuthScreen() {
  const theme = useTheme();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await signup(email.trim(), password);
      else await login(email.trim(), password);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.bg, justifyContent: "center", padding: 24 }}
    >
      <Text style={{ fontSize: 30, fontWeight: "700", color: theme.text, marginBottom: 4 }}>
        Daily
      </Text>
      <Text style={{ fontSize: 15, color: theme.textDim, marginBottom: 28 }}>
        Your day, summarized by AI.
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textDim}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          fontSize: 15,
          color: theme.text,
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textDim}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          fontSize: 15,
          color: theme.text,
          marginBottom: 14,
        }}
      />

      {error && <Text style={{ color: theme.danger, marginBottom: 12, fontSize: 13 }}>{error}</Text>}

      <TouchableOpacity
        onPress={submit}
        disabled={busy}
        style={{
          backgroundColor: theme.accent,
          borderRadius: 12,
          paddingVertical: 15,
          alignItems: "center",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            {mode === "signup" ? "Create account" : "Log in"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === "signup" ? "login" : "signup")}
        style={{ marginTop: 18, alignItems: "center" }}
      >
        <Text style={{ color: theme.textDim, fontSize: 13 }}>
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <Text style={{ color: theme.accent, fontWeight: "600" }}>
            {mode === "signup" ? "Log in" : "Create one"}
          </Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
