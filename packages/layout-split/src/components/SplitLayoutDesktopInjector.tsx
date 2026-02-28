import React, { useCallback } from "react";
import type { LayoutStrategy } from "@orderly.network/layout-core";
import type { DesktopLayoutProps } from "@orderly.network/trading";
import { useSplitPresetContext } from "../SplitPresetContext";
import { splitStrategy } from "../splitStrategy";
import { createDefaultSplitLayoutFromRule } from "../utils/splitLayoutUtils";
import { createTradingSplitLayout } from "../utils/tradingSplitLayout";
import { SplitTradingDesktopChrome } from "./SplitTradingDesktopChrome";

export interface SplitLayoutDesktopInjectorProps {
  /** Original Trading.Layout.Desktop component to wrap */
  Original: React.ComponentType<DesktopLayoutProps>;
  /** Props passed through to Original */
  props: DesktopLayoutProps;
}

/**
 * Injects getInitialLayout from preset context (rule-based layout).
 * Wraps Original desktop layout with SplitTradingDesktopChrome (DnD, Flex).
 */
export function SplitLayoutDesktopInjector({
  Original,
  props,
}: SplitLayoutDesktopInjectorProps): React.ReactElement {
  const ctx = useSplitPresetContext();

  const layoutStrategy =
    (props.layoutStrategy as LayoutStrategy | undefined) ??
    (splitStrategy as unknown as LayoutStrategy);

  const getInitialLayout = useCallback(() => {
    if (!ctx) return createTradingSplitLayout();
    const preset =
      ctx.presets.find((p) => p.id === ctx.selectedPresetId) ?? ctx.presets[0];
    if (!preset) throw new Error("Split layout: no presets defined");
    return createDefaultSplitLayoutFromRule(preset.rule);
  }, [ctx?.presets, ctx?.selectedPresetId]);

  const storageKey =
    ctx?.layoutStorageKey ?? (props.storageKey as string | undefined);

  const getInitialLayoutStable = useCallback(
    () => getInitialLayout(),
    [getInitialLayout],
  );

  return (
    <SplitTradingDesktopChrome {...props}>
      <Original
        {...props}
        layoutStrategy={layoutStrategy}
        getInitialLayout={getInitialLayoutStable}
        storageKey={storageKey}
      />
    </SplitTradingDesktopChrome>
  );
}
