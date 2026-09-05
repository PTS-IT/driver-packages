import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./src/context/AuthContext";
import { PurchasesProvider } from "./src/context/PurchasesContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

const ONBOARDING_KEY = "daily.hasOnboarded";

export default function App() {
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasOnboarded(value === "true");
      setCheckingOnboarding(false);
    });
  }, []);

  if (checkingOnboarding) return null;

  if (!hasOnboarded) {
    return (
      <OnboardingScreen
        onDone={() => {
          AsyncStorage.setItem(ONBOARDING_KEY, "true");
          setHasOnboarded(true);
        }}
      />
    );
  }

  return (
    <AuthProvider>
      <PurchasesProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </PurchasesProvider>
    </AuthProvider>
  );
}
