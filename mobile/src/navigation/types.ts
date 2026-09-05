export type RootStackParamList = {
  Tabs: undefined;
  EntryDetail: { entryId: string };
  Paywall: { reason?: "voice_limit" | "insights" | "manual" } | undefined;
};

export type TabParamList = {
  Home: undefined;
  Insights: undefined;
  Settings: undefined;
};
