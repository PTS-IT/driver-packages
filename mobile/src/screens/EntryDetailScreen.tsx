import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/colors";
import { MoodBadge } from "../components/MoodBadge";
import { deleteEntry, getEntry } from "../api/entries";
import { JournalEntry } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EntryDetail">;

export function EntryDetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    getEntry(route.params.entryId).then(setEntry).catch(() => undefined);
  }, [route.params.entryId]);

  if (!entry) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  const date = new Date(entry.createdAt);

  async function handleDelete() {
    Alert.alert("Delete entry?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entry!.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>
            {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </Text>
          <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>
            {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} ·{" "}
            {entry.source === "voice" ? "Voice entry" : "Text entry"}
          </Text>
        </View>
        <MoodBadge mood={entry.mood} />
      </View>

      {entry.summary && (
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginTop: 20,
          }}
        >
          <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
            AI SUMMARY
          </Text>
          <Text style={{ color: theme.text, fontSize: 15, lineHeight: 21 }}>{entry.summary}</Text>
        </View>
      )}

      {entry.actionItems.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700", marginBottom: 8 }}>
            ACTION ITEMS
          </Text>
          {entry.actionItems.map((item, i) => (
            <Text key={i} style={{ color: theme.text, fontSize: 14, marginBottom: 4 }}>
              ☐ {item}
            </Text>
          ))}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700", marginBottom: 8 }}>
          {entry.source === "voice" ? "TRANSCRIPT" : "ENTRY"}
        </Text>
        <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22 }}>
          {entry.transcript ?? entry.rawText}
        </Text>
      </View>

      <TouchableOpacity onPress={handleDelete} style={{ marginTop: 32, alignItems: "center" }}>
        <Text style={{ color: theme.danger, fontSize: 14 }}>Delete entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
