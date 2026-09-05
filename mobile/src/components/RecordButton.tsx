import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/colors";

interface Props {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
  durationLabel?: string;
}

export function RecordButton({ isRecording, disabled, onPress, durationLabel }: Props) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isRecording ? theme.danger : theme.accent,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{ fontSize: 34 }}>{isRecording ? "⏹" : "🎙️"}</Text>
      </Pressable>
      <Text style={{ color: theme.textDim, marginTop: 10, fontSize: 13 }}>
        {isRecording ? durationLabel ?? "Recording…" : "Tap to record today's entry"}
      </Text>
    </View>
  );
}
