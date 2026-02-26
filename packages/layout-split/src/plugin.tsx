/**
 * Split layout plugin: intercepts Trading.Layout.Desktop and wraps with split chrome
 * (markets, DnD, Flex), and injects splitStrategy + getInitialLayout when not provided.
 * Layout-related state (layoutSide, marketLayout, split sizes, etc.) is owned by this plugin.
 */
import React, { useCallback } from "react";
import type { LayoutStrategy } from "@orderly.network/layout-core";
import "@orderly.network/trading";
import type {
  DesktopLayoutInitialOptions,
  DesktopLayoutProps,
} from "@orderly.network/trading";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import {
  type LayoutSplitPluginOptions,
  SplitLayoutStateProvider,
  useSplitLayoutState,
} from "./SplitLayoutStateContext";
import { SplitTradingDesktopChrome } from "./components/SplitTradingDesktopChrome";
import { splitStrategy } from "./splitStrategy";
import { createTradingSplitLayout } from "./utils/tradingSplitLayout";

export type { LayoutSplitPluginOptions } from "./SplitLayoutStateContext";

const PLUGIN_ID = "orderly-layout-split";
const PLUGIN_NAME = "Split Layout";
const PLUGIN_VERSION = "1.0.0";

/**
 * Injects layout state from plugin context and getInitialLayout built from that state.
 */
function SplitLayoutDesktopInjector({
  Original,
  props,
}: {
  Original: React.ComponentType<DesktopLayoutProps>;
  props: DesktopLayoutProps;
}): React.ReactElement {
  const state = useSplitLayoutState();
  const layoutStrategy =
    (props.layoutStrategy as LayoutStrategy | undefined) ??
    (splitStrategy as unknown as LayoutStrategy);
  const getInitialLayout = useCallback(
    (opts: DesktopLayoutInitialOptions) =>
      createTradingSplitLayout({
        variant: opts?.variant ?? "default",
        layoutSide: state.layout,
        mainSplitSize: state.mainSplitSize,
        orderBookSplitSize: state.orderBookSplitSize,
        dataListSplitSize: state.dataListSplitSize,
      }),
    [
      state.layout,
      state.mainSplitSize,
      state.orderBookSplitSize,
      state.dataListSplitSize,
    ],
  );
  const marketsWidth =
    state.panelSize === "small" ? 0 : state.panelSize === "middle" ? 70 : 280;
  const injectedProps = {
    layout: state.layout,
    onLayout: state.setLayout,
    marketLayout: state.marketLayout,
    onMarketLayout: state.setMarketLayout,
    mainSplitSize: state.mainSplitSize,
    orderBookSplitSize: state.orderBookSplitSize,
    dataListSplitSize: state.dataListSplitSize,
    resizeable: state.resizeable,
    panelSize: state.panelSize,
    onPanelSizeChange: state.onPanelSizeChange,
    animating: state.animating,
    setAnimating: state.setAnimating,
    marketsWidth,
  };
  return (
    <SplitTradingDesktopChrome {...props} {...injectedProps}>
      <Original
        {...props}
        {...injectedProps}
        layoutStrategy={layoutStrategy}
        getInitialLayout={getInitialLayout}
      />
    </SplitTradingDesktopChrome>
  );
}

/**
 * Registers the split layout plugin: intercepts Trading.Layout.Desktop, wraps with
 * SplitLayoutStateProvider (owns layout state) and SplitTradingDesktopChrome, injects
 * splitStrategy and getInitialLayout from plugin state.
 *
 * @example
 * plugins={[registerLayoutSplitPlugin()]}
 *
 * @example
 * plugins={[registerLayoutSplitPlugin({ layoutSide: "left", marketLayout: "left" })]}
 */
export function registerLayoutSplitPlugin(
  options?: LayoutSplitPluginOptions,
): (SDK: OrderlySDK) => void {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props, _api) => (
          <SplitLayoutStateProvider options={options ?? undefined}>
            <SplitLayoutDesktopInjector
              Original={Original as React.ComponentType<DesktopLayoutProps>}
              props={props as DesktopLayoutProps}
            />
          </SplitLayoutStateProvider>
        )),
      ],
    });
  };
}
