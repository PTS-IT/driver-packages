import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { useTheme } from "../theme/colors";
import { EntryCard } from "../components/EntryCard";
import { RecordButton } from "../components/RecordButton";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { createAudioEntry, createTextEntry, listEntries } from "../api/entries";
import { JournalEntry } from "../types";
import { usePurchases } from "../context/PurchasesContext";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const FREE_VOICE_ENTRIES_PER_MONTH = 3;

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { isPremium } = usePurchases();
  const recorder = useAudioRecorder();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [noteText, setNoteText] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await listEntries();
      setEntries(data);
    } catch {
      // Backend may be unreachable during local development — leave list as-is.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const voiceEntriesThisMonth = entries.filter((e) => e.source === "voice").length;
  const overFreeVoiceLimit = !isPremium && voiceEntriesThisMonth >= FREE_VOICE_ENTRIES_PER_MONTH;

  async function handleRecordPress() {
    if (recorder.state !== "recording") {
      if (overFreeVoiceLimit) {
        navigation.navigate("Paywall", { reason: "voice_limit" });
        return;
      }
      try {
        await recorder.start();
      } catch (e: any) {
        Alert.alert("Microphone needed", e?.message ?? "Couldn't start recording.");
      }
      return;
    }

    const uri = await recorder.stop();
    recorder.reset();
    if (!uri) return;

    setUploading(true);
    try {
      const entry = await createAudioEntry(uri);
      setEntries((prev) => [entry, ...prev]);
    } catch (e: any) {
      if (e?.response?.status === 402) {
        navigation.navigate("Paywall", { reason: "voice_limit" });
      } else {
        Alert.alert("Couldn't process recording", "Please check your connection and try again.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleAddNote() {
    const text = noteText.trim();
    if (!text) return;
    setNoteText("");
    try {
      const entry = await createTextEntry(text);
      setEntries((prev) => [entry, ...prev]);
    } catch {
      Alert.alert("Couldn't save note", "Please check your connection and try again.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, alignItems: "center" }}>
        <RecordButton
          isRecording={recorder.state === "recording"}
          disabled={uploading}
          onPress={handleRecordPress}
          durationLabel={`${Math.floor(recorder.durationMs / 1000)}s`}
        />
        {!isPremium && (
          <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 10 }}>
            {Math.max(0, FREE_VOICE_ENTRIES_PER_MONTH - voiceEntriesThisMonth)} free voice entries left this month
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 12 }}>
        <TextInput
          value={noteText}
          onChangeText={setNoteText}
          placeholder="…or type a quick note"
          placeholderTextColor={theme.textDim}
          onSubmitEditing={handleAddNote}
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            color: theme.text,
            fontSize: 14,
          }}
        />
        <TouchableOpacity
          onPress={handleAddNote}
          style={{
            marginLeft: 8,
            backgroundColor: theme.accent,
            borderRadius: 12,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <EntryCard entry={item} onPress={() => navigation.navigate("EntryDetail", { entryId: item.id })} />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: theme.textDim, textAlign: "center", marginTop: 40 }}>
              No entries yet — record your first voice note above.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
