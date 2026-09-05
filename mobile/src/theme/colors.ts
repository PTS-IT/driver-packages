import { useColorScheme } from "react-native";

export const palette = {
  dark: {
    bg: "#0f172a",
    bgElevated: "#1a2438",
    card: "#1e293b",
    text: "#f1f5f9",
    textDim: "#94a3b8",
    accent: "#3b82f6",
    accent2: "#8b5cf6",
    border: "#334155",
    danger: "#ef4444",
    success: "#22c55e",
  },
  light: {
    bg: "#f1f5f9",
    bgElevated: "#ffffff",
    card: "#ffffff",
    text: "#0f172a",
    textDim: "#64748b",
    accent: "#2563eb",
    accent2: "#6d28d9",
    border: "#e2e8f0",
    danger: "#dc2626",
    success: "#16a34a",
  },
};

export type Theme = typeof palette.dark;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "light" ? palette.light : palette.dark;
}

export const MOOD_META: Record<string, { emoji: string; label: string }> = {
  great: { emoji: "🤩", label: "Great" },
  good: { emoji: "🙂", label: "Good" },
  neutral: { emoji: "😐", label: "Neutral" },
  low: { emoji: "😕", label: "Low" },
  rough: { emoji: "😣", label: "Rough" },
};
