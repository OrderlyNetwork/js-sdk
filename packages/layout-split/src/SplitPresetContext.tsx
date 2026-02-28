/**
 * Context for split layout preset list and selected preset id (persisted to localStorage).
 * Used by the plugin interceptor to pass getInitialLayout and storageKey that depend on selection.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  SPLIT_PRESET_ID_STORAGE_KEY,
  SPLIT_LAYOUT_STORAGE_KEY_PREFIX,
} from "./constants";
import type { SplitLayoutPreset } from "./types";
import { getStorageItem, writeStorage } from "./utils/storageUtils";

export interface SplitPresetContextValue {
  presets: SplitLayoutPreset[];
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  /** Storage key for LayoutHost for the current preset (per-preset layout persistence). */
  layoutStorageKey: string;
}

const SplitPresetContext = createContext<SplitPresetContextValue | null>(null);

export interface SplitPresetProviderProps {
  presets: SplitLayoutPreset[];
  children: React.ReactNode;
}

/**
 * Provides preset list and selected preset id (synced to localStorage).
 * Use with split strategy so getInitialLayout and storageKey can depend on selection.
 */
export function SplitPresetProvider({
  presets,
  children,
}: SplitPresetProviderProps): React.ReactElement {
  const [selectedPresetId, setSelectedPresetIdState] = useState<string>(() => {
    const stored = getStorageItem(SPLIT_PRESET_ID_STORAGE_KEY);
    const valid =
      stored && presets.some((p) => p.id === stored)
        ? stored
        : (presets[0]?.id ?? "");
    return valid;
  });

  const setSelectedPresetId = useCallback((id: string) => {
    setSelectedPresetIdState(id);
    writeStorage(SPLIT_PRESET_ID_STORAGE_KEY, id);
  }, []);

  const layoutStorageKey = useMemo(
    () => `${SPLIT_LAYOUT_STORAGE_KEY_PREFIX}_${selectedPresetId}`,
    [selectedPresetId],
  );

  const value = useMemo<SplitPresetContextValue>(
    () => ({
      presets,
      selectedPresetId,
      setSelectedPresetId,
      layoutStorageKey,
    }),
    [presets, selectedPresetId, setSelectedPresetId, layoutStorageKey],
  );

  return (
    <SplitPresetContext.Provider value={value}>
      {children}
    </SplitPresetContext.Provider>
  );
}

export function useSplitPresetContext(): SplitPresetContextValue | null {
  return useContext(SplitPresetContext);
}
