import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/colors";
import { usePurchases } from "../context/PurchasesContext";

type Props = NativeStackScreenProps<RootStackParamList, "Paywall">;

const REASON_COPY: Record<string, string> = {
  voice_limit: "You've used your free voice entries for this month.",
  insights: "Mood trends and insights are part of Daily Premium.",
  manual: "Unlock everything Daily can do.",
};

const FEATURES = [
  "Unlimited AI voice transcriptions",
  "AI daily summaries & action items",
  "Mood trends & streak insights",
  "Unlimited entry history",
  "Cloud backup across your devices",
];

export function PaywallScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { offering, purchasePackage, restore } = usePurchases();
  const [busyId, setBusyId] = useState<string | null>(null);

  const reason = route.params?.reason ?? "manual";

  async function handlePurchase(pkg: NonNullable<typeof offering>["availablePackages"][number]) {
    setBusyId(pkg.identifier);
    try {
      await purchasePackage(pkg);
      navigation.goBack();
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert("Purchase failed", "Please try again.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestore() {
    try {
      await restore();
      Alert.alert("Restored", "Your purchases have been restored.");
    } catch {
      Alert.alert("Nothing to restore", "We couldn't find a previous purchase for this account.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 24, paddingTop: 48 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: "flex-end" }}>
        <Text style={{ color: theme.textDim, fontSize: 22 }}>✕</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 40, textAlign: "center", marginTop: 12 }}>✨</Text>
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: "700", textAlign: "center", marginTop: 12 }}>
        Daily Premium
      </Text>
      <Text style={{ color: theme.textDim, fontSize: 14, textAlign: "center", marginTop: 6 }}>
        {REASON_COPY[reason]}
      </Text>

      <View style={{ marginTop: 24, marginBottom: 8 }}>
        {FEATURES.map((f) => (
          <View key={f} style={{ flexDirection: "row", marginBottom: 10 }}>
            <Text style={{ color: theme.success, marginRight: 8 }}>✓</Text>
            <Text style={{ color: theme.text, fontSize: 14 }}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        {!offering && (
          <Text style={{ color: theme.textDim, fontSize: 13, textAlign: "center" }}>
            Subscription plans aren't configured yet in this environment — connect RevenueCat to show
            live pricing here.
          </Text>
        )}
        {offering?.availablePackages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            onPress={() => handlePurchase(pkg)}
            disabled={busyId !== null}
            style={{
              backgroundColor: theme.accent,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
              marginBottom: 10,
              opacity: busyId && busyId !== pkg.identifier ? 0.5 : 1,
            }}
          >
            {busyId === pkg.identifier ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                {pkg.product.title} — {pkg.product.priceString}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleRestore} style={{ marginTop: 8, alignItems: "center" }}>
        <Text style={{ color: theme.textDim, fontSize: 13 }}>Restore purchases</Text>
      </TouchableOpacity>
    </View>
  );
}
