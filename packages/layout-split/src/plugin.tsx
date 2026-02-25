/**
 * Split layout plugin: intercepts Trading.Layout.Desktop and wraps with split chrome
 * (markets, DnD, Flex), and injects splitStrategy + getInitialLayout when not provided.
 */
import type { LayoutStrategy } from "@orderly.network/layout-core";
import "@orderly.network/trading";
import type { DesktopLayoutInitialOptions } from "@orderly.network/trading";
import type { OrderlySDK } from "@orderly.network/ui";
import { createInterceptor } from "@orderly.network/ui";
import { SplitTradingDesktopChrome } from "./components/SplitTradingDesktopChrome";
import { splitStrategy } from "./splitStrategy";
import { createTradingSplitLayout } from "./utils/tradingSplitLayout";

const PLUGIN_ID = "orderly-layout-split";
const PLUGIN_NAME = "Split Layout";
const PLUGIN_VERSION = "1.0.0";

/**
 * Registers the split layout plugin: intercepts Trading.Layout.Desktop, wraps with
 * SplitTradingDesktopChrome (markets, DnD, Flex), and injects splitStrategy and
 * getInitialLayout when the host does not provide them.
 *
 * @example
 * plugins={[registerLayoutSplitPlugin()]}
 */
export function registerLayoutSplitPlugin(
  _options?: Record<string, unknown>,
): (SDK: OrderlySDK) => void {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_NAME,
      version: PLUGIN_VERSION,
      orderlyVersion: ">=1.0.0",
      interceptors: [
        createInterceptor("Trading.Layout.Desktop", (Original, props, _api) => {
          const layoutStrategy =
            props.layoutStrategy ??
            (splitStrategy as unknown as LayoutStrategy);
          const getInitialLayout =
            props.getInitialLayout ??
            ((opts: DesktopLayoutInitialOptions) =>
              createTradingSplitLayout({
                variant: opts.variant,
                layoutSide: opts.layoutSide,
                mainSplitSize: opts.mainSplitSize,
                orderBookSplitSize: opts.orderBookSplitSize,
                dataListSplitSize: opts.dataListSplitSize,
              }));
          return (
            <SplitTradingDesktopChrome {...props}>
              <Original
                {...props}
                layoutStrategy={layoutStrategy}
                getInitialLayout={getInitialLayout}
              />
            </SplitTradingDesktopChrome>
          );
        }),
      ],
    });
  };
}
