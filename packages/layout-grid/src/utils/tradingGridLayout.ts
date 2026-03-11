/**
 * Default trading grid layout for LayoutHost with gridStrategy.
 * Panel IDs come from layout-core (getTradingPanelIds); component mapping is in the trading package.
 */
import { getTradingPanelIds } from "@orderly.network/layout-core";
import type { GridLayoutModel, GridLayoutPreset } from "../types";
import { DEFAULT_GRID_PRESETS } from "./defaultPresets";
import { createDefaultGridLayout } from "./gridLayoutUtils";

/**
 * Creates a trading grid layout from an optional preset.
 * When preset is null/undefined, uses the first built-in preset (exchange-style).
 *
 * @param preset - Optional preset; when omitted, uses DEFAULT_GRID_PRESETS[0]
 * @returns GridLayoutModel
 */
export function createTradingGridLayoutFromPreset(
  preset?: GridLayoutPreset | null,
): GridLayoutModel {
  const panelIds = getTradingPanelIds();
  const p = preset ?? DEFAULT_GRID_PRESETS[0];
  if (!p) throw new Error("Grid layout: no default presets");
  return createDefaultGridLayout(panelIds as string[], p.rule, p.rowHeight);
}

/**
 * Creates a default trading grid layout using the first built-in preset rule.
 * Thin wrapper over createTradingGridLayoutFromPreset for backward compatibility.
 *
 * @returns GridLayoutModel
 */
export function createTradingGridLayout(): GridLayoutModel {
  return createTradingGridLayoutFromPreset();
}
