/**
 * Context for grid layout preset list and selected preset id (persisted to localStorage).
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
  GRID_PRESET_ID_STORAGE_KEY,
  GRID_LAYOUT_STORAGE_KEY_PREFIX,
} from "./constants";
import type { GridLayoutPreset } from "./types";

function readStoredPresetId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(GRID_PRESET_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredPresetId(id: string): void {
  try {
    window.localStorage?.setItem(GRID_PRESET_ID_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export interface GridPresetContextValue {
  presets: GridLayoutPreset[];
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  /** Storage key for LayoutHost for the current preset (per-preset layout persistence). */
  layoutStorageKey: string;
}

const GridPresetContext = createContext<GridPresetContextValue | null>(null);

export interface GridPresetProviderProps {
  presets: GridLayoutPreset[];
  children: React.ReactNode;
}

/**
 * Provides preset list and selected preset id (synced to localStorage).
 * Use with grid strategy so getInitialLayout and storageKey can depend on selection.
 */
export function GridPresetProvider({
  presets,
  children,
}: GridPresetProviderProps): React.ReactElement {
  const [selectedPresetId, setSelectedPresetIdState] = useState<string>(() => {
    const stored = readStoredPresetId();
    const valid =
      stored && presets.some((p) => p.id === stored)
        ? stored
        : (presets[0]?.id ?? "");
    return valid;
  });

  const setSelectedPresetId = useCallback((id: string) => {
    setSelectedPresetIdState(id);
    writeStoredPresetId(id);
  }, []);

  const layoutStorageKey = useMemo(
    () => `${GRID_LAYOUT_STORAGE_KEY_PREFIX}_${selectedPresetId}`,
    [selectedPresetId],
  );

  const value = useMemo<GridPresetContextValue>(
    () => ({
      presets,
      selectedPresetId,
      setSelectedPresetId,
      layoutStorageKey,
    }),
    [presets, selectedPresetId, setSelectedPresetId, layoutStorageKey],
  );

  return (
    <GridPresetContext.Provider value={value}>
      {children}
    </GridPresetContext.Provider>
  );
}

export function useGridPresetContext(): GridPresetContextValue | null {
  return useContext(GridPresetContext);
}
