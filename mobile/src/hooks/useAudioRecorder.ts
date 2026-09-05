import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";

export type RecorderState = "idle" | "recording" | "stopped";

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission was denied.");
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording) setDurationMs(status.durationMillis ?? 0);
    });
    await recording.startAsync();
    recordingRef.current = recording;
    setState("recording");
  }, []);

  const stop = useCallback(async (): Promise<string | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    recordingRef.current = null;
    setState("stopped");
    return uri ?? null;
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setDurationMs(0);
  }, []);

  return { state, durationMs, start, stop, reset };
}
