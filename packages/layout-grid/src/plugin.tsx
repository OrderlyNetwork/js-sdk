/**
 * Grid layout plugin: intercepts Trading.Layout.Desktop and injects layoutStrategy +
 * getInitialLayout (and optional storageKey) when the host does not pass them.
 * Supports multiple layout presets; user selection is persisted to localStorage.
 */
/** Load trading first so its InterceptorTargetPropsMap augmentation is in scope for createInterceptor. */
import React from "react";
import type { LayoutStrategy, LayoutModel } from "@orderly.network/layout-core";
import "@orderly.network/trading";
import type { DesktopLayoutInitialOptions } from "@orderly.network/trading";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { GridPresetProvider, useGridPresetContext } from "./GridPresetContext";
import { gridStrategy } from "./gridStrategy";
import type { GridLayoutModel, GridLayoutPreset } from "./types";
import { getDefaultGridPresets } from "./utils/defaultPresets";
import { createDefaultGridLayout } from "./utils/gridLayoutUtils";
import {
  getTradingGridPanelIds,
  createTradingGridLayout,
} from "./utils/tradingGridLayout";

/**
 * Receives built-in presets and returns the final preset list (merge or replace).
 */
export type ResolveLayoutPresets = (
  builtInPresets: GridLayoutPreset[],
) => GridLayoutPreset[];

/**
 * Options for the grid layout plugin.
 */
export interface LayoutGridPluginOptions {
  /**
   * Receives built-in presets; return the final preset list (e.g. merge or replace).
   * When omitted, built-in presets are used as-is.
   */
  layouts?: ResolveLayoutPresets;
  /** Override initial layout when provided (ignores preset selection). */
  getInitialLayout?: () => GridLayoutModel;
}

const PLUGIN_ID = "orderly-layout-grid";
const PLUGIN_NAME = "Grid Layout";
const PLUGIN_VERSION = "1.0.0";

/** Props passed through to DesktopLayout (from interceptor). */
type DesktopLayoutInterceptorProps = Record<string, unknown>;

/**
 * Injects getInitialLayout and storageKey from grid preset context when we are providing grid.
 */
function GridDesktopInjector({
  Original,
  props,
  usePresetSelection,
}: {
  Original: React.ComponentType<DesktopLayoutInterceptorProps>;
  props: DesktopLayoutInterceptorProps;
  usePresetSelection: boolean;
}): React.ReactElement {
  const ctx = useGridPresetContext();

  const getInitialLayout = React.useCallback(() => {
    if (!usePresetSelection || !ctx) {
      return createTradingGridLayout();
    }
    const preset =
      ctx.presets.find((p) => p.id === ctx.selectedPresetId) ?? ctx.presets[0];
    if (!preset) return createTradingGridLayout();
    return createDefaultGridLayout(getTradingGridPanelIds(), preset.rule);
  }, [usePresetSelection, ctx?.presets, ctx?.selectedPresetId]);

  const storageKey =
    usePresetSelection && ctx
      ? ctx.layoutStorageKey
      : (props.storageKey as string | undefined);

  return (
    <Original
      {...props}
      layoutStrategy={
        (props.layoutStrategy as LayoutStrategy | undefined) ??
        (gridStrategy as unknown as LayoutStrategy)
      }
      getInitialLayout={
        (props.getInitialLayout as
          | ((opts: DesktopLayoutInitialOptions) => LayoutModel | undefined)
          | undefined) ??
        ((_opts: DesktopLayoutInitialOptions) => getInitialLayout())
      }
      storageKey={storageKey}
    />
  );
}

/**
 * Registers the grid layout plugin.
 *
 * @example
 * plugins={[registerLayoutGridPlugin()]}
 *
 * @example
 * plugins={[registerLayoutGridPlugin({ layouts: (builtIn) => [...builtIn, myPreset] })]}
 */
export function registerLayoutGridPlugin(
  options?: LayoutGridPluginOptions,
): (SDK: OrderlySDK) => void {
  const resolvedPresets = options?.layouts
    ? options.layouts(getDefaultGridPresets())
    : getDefaultGridPresets();

  const usePresetSelection = options?.getInitialLayout == null;

  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props, _api) => (
          <GridPresetProvider presets={resolvedPresets}>
            <GridDesktopInjector
              Original={
                Original as unknown as React.ComponentType<DesktopLayoutInterceptorProps>
              }
              props={props as unknown as DesktopLayoutInterceptorProps}
              usePresetSelection={usePresetSelection}
            />
          </GridPresetProvider>
        )),
      ],
    });
  };
}
