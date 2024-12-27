import { useState } from "react";

export type FundingTabName = "overview" | "comparison";

export type UseFundingScript = ReturnType<typeof useFundingScript>;

export function useFundingScript() {
  const [activeFundingTab, setActiveFundingTab] =
    useState<FundingTabName>("overview");

  return {
    activeFundingTab,
    onFundingTabChange: (value: string) =>
      setActiveFundingTab(value as FundingTabName),
  };
}
