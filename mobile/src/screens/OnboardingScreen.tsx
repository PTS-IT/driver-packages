import React, { useState } from "react";
import { Dimensions, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/colors";

const SLIDES = [
  {
    emoji: "🎙️",
    title: "Speak your day",
    body: "One tap to record a 30-second voice note. No typing required.",
  },
  {
    emoji: "✨",
    title: "AI does the rest",
    body: "Daily transcribes it, writes a short summary, and picks up your mood and to-dos automatically.",
  },
  {
    emoji: "📈",
    title: "See your patterns",
    body: "Mood trends, streaks, and a searchable timeline of every entry you've ever made.",
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const width = Dimensions.get("window").width;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: "center", justifyContent: "center", padding: 32 }}>
            <Text style={{ fontSize: 72, marginBottom: 24 }}>{item.emoji}</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: theme.text, textAlign: "center" }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textDim,
                textAlign: "center",
                marginTop: 12,
                lineHeight: 22,
              }}
            >
              {item.body}
            </Text>
          </View>
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: i === index ? theme.accent : theme.border,
            }}
          />
        ))}
      </View>
      <TouchableOpacity
        onPress={onDone}
        style={{
          backgroundColor: theme.accent,
          borderRadius: 14,
          marginHorizontal: 24,
          marginBottom: 32,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {index === SLIDES.length - 1 ? "Get started" : "Skip"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
