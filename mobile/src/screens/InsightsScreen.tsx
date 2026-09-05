import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useTheme } from "../theme/colors";
import { MOOD_META } from "../theme/colors";
import { usePurchases } from "../context/PurchasesContext";
import { getInsights } from "../api/entries";
import { InsightsSummary } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Insights">,
  NativeStackScreenProps<RootStackParamList>
>;

export function InsightsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { isPremium } = usePurchases();
  const [insights, setInsights] = useState<InsightsSummary | null>(null);

  useEffect(() => {
    if (!isPremium) return;
    getInsights().then(setInsights).catch(() => undefined);
  }, [isPremium]);

  if (!isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: "center", padding: 28 }}>
        <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>📈</Text>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700", textAlign: "center" }}>
          Mood trends & insights
        </Text>
        <Text style={{ color: theme.textDim, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
          See your streak, mood over time, and recurring themes across every entry — included with Daily
          Premium.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Paywall", { reason: "insights" })}
          style={{
            backgroundColor: theme.accent,
            borderRadius: 14,
            paddingVertical: 15,
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Unlock Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Insights</Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <StatCard label="Day streak" value={String(insights?.streakDays ?? 0)} theme={theme} />
        <StatCard label="Entries this week" value={String(insights?.entriesThisWeek ?? 0)} theme={theme} />
      </View>

      <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700", marginBottom: 10 }}>
        MOOD, LAST 14 DAYS
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {(insights?.moodTrend ?? []).map((point) => (
          <View key={point.date} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 22 }}>{MOOD_META[point.mood]?.emoji ?? "·"}</Text>
            <Text style={{ color: theme.textDim, fontSize: 10, marginTop: 2 }}>
              {new Date(point.date).toLocaleDateString(undefined, { day: "numeric" })}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700", marginBottom: 10 }}>
        RECURRING THEMES
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(insights?.topThemes ?? []).map((theme_) => (
          <View
            key={theme_}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 13 }}>{theme_}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 26, fontWeight: "700" }}>{value}</Text>
      <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
