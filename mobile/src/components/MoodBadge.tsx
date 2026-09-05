import React from "react";
import { Text, View } from "react-native";
import { Mood } from "../types";
import { MOOD_META, useTheme } from "../theme/colors";

export function MoodBadge({ mood }: { mood: Mood | null }) {
  const theme = useTheme();
  if (!mood) return null;
  const meta = MOOD_META[mood];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.bgElevated,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
      <Text style={{ fontSize: 12, color: theme.textDim, marginLeft: 4 }}>{meta.label}</Text>
    </View>
  );
}
