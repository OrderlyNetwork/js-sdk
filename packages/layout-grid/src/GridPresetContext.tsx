/**
 * Context for grid layout preset list and selected preset id (persisted via LayoutRuleManager).
 * Used by the plugin interceptor to pass getInitialLayout and storageKey that depend on selection.
 */
import React, { createContext, useContext, useMemo } from "react";
import {
  LayoutRuleManager,
  useLayoutRuleManager,
} from "@orderly.network/layout-core";
import {
  GRID_PRESET_ID_STORAGE_KEY,
  GRID_LAYOUT_STORAGE_KEY_PREFIX,
} from "./constants";
import type { GridLayoutPreset } from "./types";

export interface GridPresetContextValue {
  presets: GridLayoutPreset[];
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  /** Storage key for LayoutHost for the current preset (per-preset layout persistence). */
  layoutStorageKey: string;
  /** Clears persisted layout for current preset (reset to preset rule). */
  reset: () => void;
  /** Row height of the selected preset for finer grid adjustment */
  rowHeight?: number;
}

const GridPresetContext = createContext<GridPresetContextValue | null>(null);

export interface GridPresetProviderProps {
  presets: GridLayoutPreset[];
  /** When false, no localStorage persistence for preset selection or layout. Default true. */
  persistLayout?: boolean;
  children: React.ReactNode;
}

/**
 * Provides preset list and selected preset id (synced to localStorage via LayoutRuleManager).
 * Use with grid strategy so getInitialLayout and storageKey can depend on selection.
 */
export function GridPresetProvider({
  presets,
  persistLayout = true,
  children,
}: GridPresetProviderProps): React.ReactElement {
  const manager = useMemo(
    () =>
      new LayoutRuleManager(presets, {
        presetIdStorageKey: GRID_PRESET_ID_STORAGE_KEY,
        layoutStorageKeyPrefix: GRID_LAYOUT_STORAGE_KEY_PREFIX,
        persist: persistLayout,
      }),
    [presets, persistLayout],
  );

  const ruleState = useLayoutRuleManager(manager);

  const value = useMemo<GridPresetContextValue>(() => {
    const selectedPreset = (ruleState.presets as GridLayoutPreset[]).find(
      (p) => p.id === ruleState.selectedPresetId,
    );
    return {
      presets: ruleState.presets as GridLayoutPreset[],
      selectedPresetId: ruleState.selectedPresetId,
      setSelectedPresetId: ruleState.setSelectedPresetId,
      layoutStorageKey: ruleState.layoutStorageKey,
      reset: ruleState.reset,
      rowHeight: selectedPreset?.rowHeight,
    };
  }, [
    ruleState.presets,
    ruleState.selectedPresetId,
    ruleState.setSelectedPresetId,
    ruleState.layoutStorageKey,
    ruleState.reset,
  ]);

  return (
    <GridPresetContext.Provider value={value}>
      {children}
    </GridPresetContext.Provider>
  );
}

export function useGridPresetContext(): GridPresetContextValue | null {
  return useContext(GridPresetContext);
}
