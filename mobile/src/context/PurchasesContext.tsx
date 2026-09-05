import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import Purchases, { CustomerInfo, PurchasesOffering } from "react-native-purchases";
import { useAuth } from "./AuthContext";

const ENTITLEMENT_ID = "premium";

interface PurchasesContextValue {
  isReady: boolean;
  isPremium: boolean;
  offering: PurchasesOffering | null;
  purchasePackage: (pkg: PurchasesOffering["availablePackages"][number]) => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

function hasPremiumEntitlement(info: CustomerInfo | null): boolean {
  return Boolean(info?.entitlements.active[ENTITLEMENT_ID]);
}

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const apiKey = Platform.select({
      ios: Constants.expoConfig?.extra?.revenueCatApiKeyIos as string | undefined,
      android: Constants.expoConfig?.extra?.revenueCatApiKeyAndroid as string | undefined,
    });
    if (!apiKey || apiKey.includes("REPLACE_ME")) {
      // RevenueCat isn't configured yet (no real API key). Skip init so the
      // rest of the app still works during local development.
      setIsReady(true);
      return;
    }
    Purchases.configure({ apiKey });
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      if (user) {
        try {
          await Purchases.logIn(user.id);
        } catch {
          // RevenueCat not configured in this environment yet — non-fatal.
        }
      }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user?.id]);

  async function refresh() {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const offerings = await Purchases.getOfferings();
      setOffering(offerings.current ?? null);
    } catch {
      // Not configured / offline — leave state as-is.
    }
  }

  const value = useMemo<PurchasesContextValue>(
    () => ({
      isReady,
      isPremium: hasPremiumEntitlement(customerInfo) || Boolean(user?.isPremium),
      offering,
      async purchasePackage(pkg) {
        const { customerInfo: info } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(info);
      },
      async restore() {
        const info = await Purchases.restorePurchases();
        setCustomerInfo(info);
      },
      refresh,
    }),
    [isReady, customerInfo, offering, user?.isPremium]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error("usePurchases must be used within PurchasesProvider");
  return ctx;
}
