import type { AppFeatures } from "@orderly.network/types";
import { useAppContext } from "../provider/appStateContext";

/** Read an application feature. Omitted configuration keeps it enabled. */
export function useFeatureEnabled(feature: keyof AppFeatures): boolean {
  const { features } = useAppContext();
  return features?.[feature] !== false;
}
