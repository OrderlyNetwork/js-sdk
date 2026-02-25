/**
 * Grid layout plugin: intercepts Trading.Page and injects layoutStrategy + getInitialLayout
 * when the host does not pass them. DesktopLayout then reads from context and renders LayoutHost
 * with grid strategy; no renderContent, same "accept layout strategy" flow as split.
 */
/** Load trading first so its InterceptorTargetPropsMap augmentation is in scope for createInterceptor. */
import type { LayoutStrategy } from "@orderly.network/layout-core";
import "@orderly.network/trading";
import type { DesktopLayoutInitialOptions } from "@orderly.network/trading";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { gridStrategy } from "./gridStrategy";
import type { GridLayoutModel } from "./types";
import { createTradingGridLayout } from "./utils/tradingGridLayout";

/**
 * Options for the grid layout plugin. When host does not pass layoutStrategy/getInitialLayout,
 * the plugin injects grid; options allow customising the initial layout factory.
 */
export interface LayoutGridPluginOptions {
  /** Custom initial layout factory; when omitted, createTradingGridLayout() is used */
  getInitialLayout?: () => GridLayoutModel;
}

const PLUGIN_ID = "orderly-layout-grid";
const PLUGIN_NAME = "Grid Layout";
const PLUGIN_VERSION = "1.0.0";

/**
 * Registers the grid layout plugin: intercepts Trading.Page and injects gridStrategy and
 * getInitialLayout when the host does not provide layoutStrategy. Host can still pass
 * layoutStrategy (e.g. split) to use that instead; default split usage unchanged.
 *
 * @example
 * plugins={[registerLayoutGridPlugin()]}
 *
 * @example
 * plugins={[registerLayoutGridPlugin({ getInitialLayout: myLayout })]}
 */
export function registerLayoutGridPlugin(
  options?: LayoutGridPluginOptions,
): (SDK: OrderlySDK) => void {
  const getInitialLayout = options?.getInitialLayout ?? createTradingGridLayout;

  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props, _api) => (
          <Original
            {...props}
            layoutStrategy={
              props.layoutStrategy ??
              (gridStrategy as unknown as LayoutStrategy)
            }
            getInitialLayout={
              props.getInitialLayout ??
              ((_opts: DesktopLayoutInitialOptions) => getInitialLayout())
            }
          />
        )),
      ],
    });
  };
}
