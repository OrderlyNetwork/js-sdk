import { useCallback } from "react";
import type { LayoutStrategy } from "@orderly.network/layout-core";
import type { DesktopLayoutProps } from "@orderly.network/trading";
import { useSplitPresetContext } from "../SplitPresetContext";
import { splitStrategy } from "../splitStrategy";
import type { SplitLayoutPreset } from "../types";
import { createDefaultSplitLayoutFromRule } from "../utils/splitLayoutUtils";
import { createTradingSplitLayout } from "../utils/tradingSplitLayout";
import { SplitTradingDesktopChrome } from "./SplitTradingDesktopChrome";

/** Inlined layout component (was SplitLayoutDesktopInjector). */
export function SplitInlinedLayout({
  Original,
  props,
}: {
  Original: React.ComponentType<DesktopLayoutProps>;
  props: DesktopLayoutProps;
}): React.ReactElement {
  const ctx = useSplitPresetContext();

  const layoutStrategy =
    (props.layoutStrategy as LayoutStrategy | undefined) ??
    (splitStrategy as unknown as LayoutStrategy);

  const getInitialLayout = useCallback(() => {
    if (!ctx) return createTradingSplitLayout();
    const preset =
      ctx.presets.find(
        (p: SplitLayoutPreset) => p.id === ctx.selectedPresetId,
      ) ?? ctx.presets[0];
    if (!preset) throw new Error("Split layout: no presets defined");
    return createDefaultSplitLayoutFromRule(preset.rule);
  }, [ctx?.presets, ctx?.selectedPresetId]);

  const storageKey =
    ctx?.layoutStorageKey ?? (props.storageKey as string | undefined);

  return (
    <SplitTradingDesktopChrome {...props}>
      <Original
        {...props}
        layoutStrategy={layoutStrategy}
        getInitialLayout={getInitialLayout}
        storageKey={storageKey}
      />
    </SplitTradingDesktopChrome>
  );
}
