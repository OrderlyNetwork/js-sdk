/**
 * Context for split layout preset list and selected preset id (persisted via LayoutRuleManager).
 * Also provides showIndicator for sort indicator visibility.
 * Used by the plugin interceptor to pass getInitialLayout and storageKey that depend on selection.
 */
import React, { createContext, useContext, useMemo } from "react";
import {
  LayoutRuleManager,
  useLayoutRuleManager,
} from "@orderly.network/layout-core";
import {
  SPLIT_PRESET_ID_STORAGE_KEY,
  SPLIT_LAYOUT_STORAGE_KEY_PREFIX,
} from "./constants";
import type { SplitLayoutPreset } from "./types";

/** Plugin classNames applied to panel group, panel, and handle (from LayoutSplitPluginOptions). */
export type SplitLayoutClassNames = {
  panelGroup?: string;
  panel?: string;
  handle?: string;
};

export interface SplitPresetContextValue {
  presets: SplitLayoutPreset[];
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  /** Storage key for LayoutHost for the current preset (per-preset layout persistence). */
  layoutStorageKey: string;
  /** Clears persisted layout for current preset (reset to preset rule). */
  reset: () => void;
  /** Optional classNames for panel group, panel, and handle (from plugin options). */
  classNames?: SplitLayoutClassNames;
  /** Optional gap between panels in px (similar to Tailwind gap-*; applied to handle margin). */
  gap?: number;
  /** When true, show drag handle on sortable panels; when false, hide it. */
  showIndicator?: boolean;
}

const SplitPresetContext = createContext<SplitPresetContextValue | null>(null);

export interface SplitPresetProviderProps {
  presets: SplitLayoutPreset[];
  /** Optional classNames for panel group, panel, and handle (from plugin options). */
  classNames?: SplitLayoutClassNames;
  /** Optional gap between panels in px (similar to Tailwind gap-*). */
  gap?: number;
  /** Optional showIndicator for sort indicator visibility. */
  showIndicator?: boolean;
  children: React.ReactNode;
}

/**
 * Provides preset list and selected preset id (synced to localStorage via LayoutRuleManager).
 * Use with split strategy so getInitialLayout and storageKey can depend on selection.
 */
export function SplitPresetProvider({
  presets,
  classNames,
  gap,
  showIndicator,
  children,
}: SplitPresetProviderProps): React.ReactElement {
  const manager = useMemo(
    () =>
      new LayoutRuleManager(presets, {
        presetIdStorageKey: SPLIT_PRESET_ID_STORAGE_KEY,
        layoutStorageKeyPrefix: SPLIT_LAYOUT_STORAGE_KEY_PREFIX,
      }),
    [presets],
  );

  const ruleState = useLayoutRuleManager(manager);

  const value = useMemo<SplitPresetContextValue>(
    () => ({
      presets: ruleState.presets as SplitLayoutPreset[],
      selectedPresetId: ruleState.selectedPresetId,
      setSelectedPresetId: ruleState.setSelectedPresetId,
      layoutStorageKey: ruleState.layoutStorageKey,
      reset: ruleState.reset,
      classNames: classNames ?? undefined,
      gap: gap ?? undefined,
      showIndicator,
    }),
    [
      ruleState.presets,
      ruleState.selectedPresetId,
      ruleState.setSelectedPresetId,
      ruleState.layoutStorageKey,
      ruleState.reset,
      classNames,
      gap,
      showIndicator,
    ],
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
