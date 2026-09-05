import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useTheme } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { usePurchases } from "../context/PurchasesContext";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Settings">,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isPremium } = usePurchases();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 20, paddingTop: 60 }}>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: "700", marginBottom: 20 }}>Settings</Text>

      <View
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}>{user?.email}</Text>
        <Text style={{ color: isPremium ? theme.success : theme.textDim, fontSize: 13, marginTop: 4 }}>
          {isPremium ? "Premium member" : "Free plan"}
        </Text>
      </View>

      {!isPremium && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Paywall", { reason: "manual" })}
          style={{
            backgroundColor: theme.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() =>
          Alert.alert("Log out?", undefined, [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: logout },
          ])
        }
        style={{
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.danger, fontWeight: "600" }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
