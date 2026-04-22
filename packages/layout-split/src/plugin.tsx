/// <reference types="@orderly.network/trading-next" />
import React from "react";
import type { LayoutStrategy } from "@orderly.network/layout-core";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { SymbolBarLayoutSwitcher } from "./components/SymbolBarLayoutSwitcher";
import { splitTradingStrategy } from "./splitTradingStrategy";

/** Plugin registration options */
export interface LayoutSplitPluginOptions {
  gap?: number;
  classNames?: {
    panelGroup?: string;
    panel?: string;
    handle?: string;
    container?: string;
  };
}

const PLUGIN_ID = "orderly-layout-split";
const PLUGIN_NAME = "Split Layout";
const PLUGIN_VERSION = "1.0.0";

/**
 * Registers the split trading layout plugin.
 *
 * Intercepts `Trading.Layout.Desktop` and injects `layoutStrategy` into the
 * original DesktopLayout component — exactly like GridDesktopInjector.
 * DesktopLayout calls LayoutHost, which calls splitTradingStrategy.Renderer
 * (SplitTradingLayout) with the PanelRegistry built by trading-next.
 */
export function registerLayoutSplitPlugin(
  options: LayoutSplitPluginOptions = {},
): (SDK: OrderlySDK) => void {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props) => (
          <Original
            {...props}
            layoutStrategy={splitTradingStrategy as unknown as LayoutStrategy}
            // State is managed internally by SplitTradingLayout — no model to persist here.
            getInitialLayout={() => ({})}
            disableLayoutPersistence={true}
          />
        )),
        createInterceptor(
          "Trading.SymbolInfoBar.Desktop",
          (Original, props) => (
            <Original
              {...props}
              trailing={
                <>
                  {props.trailing}
                  <SymbolBarLayoutSwitcher />
                </>
              }
            />
          ),
        ),
      ],
    });
  };
}
