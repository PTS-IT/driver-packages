import React from "react";
import { Pressable, Text, View } from "react-native";
import { JournalEntry } from "../types";
import { useTheme } from "../theme/colors";
import { MoodBadge } from "./MoodBadge";

export function EntryCard({ entry, onPress }: { entry: JournalEntry; onPress: () => void }) {
  const theme = useTheme();
  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const preview = entry.summary ?? entry.transcript ?? entry.rawText;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: theme.textDim, fontSize: 12 }}>
          {dateLabel} · {timeLabel} · {entry.source === "voice" ? "🎙️ Voice" : "✍️ Text"}
        </Text>
        <MoodBadge mood={entry.mood} />
      </View>
      <Text style={{ color: theme.text, fontSize: 15, lineHeight: 20 }} numberOfLines={3}>
        {entry.processing ? "Transcribing and analyzing…" : preview}
      </Text>
      {entry.actionItems.length > 0 && (
        <Text style={{ color: theme.accent, fontSize: 12, marginTop: 6 }}>
          {entry.actionItems.length} action item{entry.actionItems.length > 1 ? "s" : ""}
        </Text>
      )}
    </Pressable>
  );
}
