/**
 * Trading split layout: builds SplitLayoutModel from the default exchange-style preset rule.
 * Used by storybook or when a caller needs a ready-made trading layout; plugin uses preset context instead.
 */
import type { SplitLayoutModel } from "../types";
import { getDefaultSplitPresets } from "./defaultPresets";
import { createDefaultSplitLayoutFromRule } from "./splitLayoutUtils";

/** Options kept for API compatibility; layout structure comes from preset rule. */
export interface TradingSplitLayoutOptions {
  variant?: "default" | "max2XL";
  layoutSide?: "left" | "right";
  mainSplitSize?: string;
  orderBookSplitSize?: string;
  dataListSplitSize?: string;
}

/**
 * Returns a trading split layout model from the first built-in preset rule.
 * Sizes and layoutSide are not applied (structure is from rule); options are ignored in the refactored design.
 *
 * @param _options - Ignored; structure is defined by preset rule
 * @returns SplitLayoutModel with layouts and breakpoints
 */
export function createTradingSplitLayout(
  _options?: TradingSplitLayoutOptions,
): SplitLayoutModel {
  const presets = getDefaultSplitPresets();
  const preset = presets[0];
  if (!preset) throw new Error("Split layout: no default presets");
  return createDefaultSplitLayoutFromRule(preset.rule);
}
