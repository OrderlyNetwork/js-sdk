import React from "react";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { SplitPresetProvider } from "./SplitPresetContext";
import { SplitLayoutDesktopInjector } from "./components/SplitLayoutDesktopInjector";
import { SymbolBarLayoutSwitcher } from "./components/SymbolBarLayoutSwitcher";
import type { SplitLayoutPreset } from "./types";
import { getDefaultSplitPresets } from "./utils/defaultPresets";

/** Receives built-in presets and returns the final preset list (merge or replace). */
export type ResolveSplitLayoutPresets = (
  builtInPresets: SplitLayoutPreset[],
) => SplitLayoutPreset[];

/** Plugin registration options (layout customization only). */
export interface LayoutSplitPluginOptions {
  /** Receives built-in presets; return the final preset list. */
  layouts?: ResolveSplitLayoutPresets;
  gap?: number;
  classNames?: {
    panelGroup?: string;
    panel?: string;
    handle?: string;
  };
}

const PLUGIN_ID = "orderly-layout-split";
const PLUGIN_NAME = "Split Layout";
const PLUGIN_VERSION = "1.0.0";

export function registerLayoutSplitPlugin(
  options?: LayoutSplitPluginOptions,
): (SDK: OrderlySDK) => void {
  const resolvedPresets = options?.layouts
    ? options.layouts(getDefaultSplitPresets())
    : getDefaultSplitPresets();

  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props) => (
          <SplitPresetProvider
            presets={resolvedPresets}
            classNames={options?.classNames}
            gap={options?.gap ?? 2}
          >
            <SplitLayoutDesktopInjector
              Original={Original as React.ComponentType<any>}
              props={props as any}
            />
          </SplitPresetProvider>
        )),
        createInterceptor(
          "Trading.SymbolInfoBar.Desktop",
          (Original, props) => {
            return (
              <Original
                {...props}
                trailing={
                  <>
                    {props.trailing}
                    <SymbolBarLayoutSwitcher />
                  </>
                }
              />
            );
          },
        ),
      ],
    });
  };
}
