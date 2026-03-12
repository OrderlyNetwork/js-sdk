import type { GridConfig, GridLayoutModel, GridLayoutPreset } from "../types";
import { createTradingGridLayoutFromPreset } from "./tradingGridLayout";

export const DEFAULT_GRID_CONFIG = {
  rowHeight: 30,
  margin: [8, 8] as [number, number],
  containerPadding: [0, 0] as [number, number],
  compactType: "vertical" as const,
  isDraggable: true,
  isResizable: true,
};

export function mergeGridConfig(
  userConfig: GridConfig | undefined,
  presetRowHeight?: number,
) {
  return {
    ...DEFAULT_GRID_CONFIG,
    ...(presetRowHeight !== undefined && { rowHeight: presetRowHeight }),
    ...userConfig,
  };
}

export function createDefaultGetInitialLayout(
  presets: GridLayoutPreset[],
): () => GridLayoutModel {
  return () => {
    const preset = presets[0];
    return createTradingGridLayoutFromPreset(preset);
  };
}
