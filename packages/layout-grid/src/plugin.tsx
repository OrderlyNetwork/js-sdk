import React from "react";
import "@orderly.network/trading";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { GridDesktopInjector } from "./components/GridDesktopInjector";
import type { LayoutGridPluginOptions } from "./types";
import { getDefaultGridPresets } from "./utils/defaultPresets";

const PLUGIN_ID = "orderly-layout-grid";
const PLUGIN_NAME = "Grid Layout";
const PLUGIN_VERSION = "1.0.0";

export type { LayoutGridPluginOptions } from "./types";

/** Registers the grid layout plugin (Trading.Layout.Desktop interceptor). */
export function registerLayoutGridPlugin(
  options?: LayoutGridPluginOptions,
): (SDK: OrderlySDK) => void {
  const resolvedPresets = options?.presets ?? getDefaultGridPresets();

  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props) => (
          <GridDesktopInjector
            Original={
              Original as unknown as React.ComponentType<
                Record<string, unknown>
              >
            }
            props={props as unknown as Record<string, unknown>}
            options={{
              ...options,
              presets: resolvedPresets,
            }}
          />
        )),
      ],
    });
  };
}
