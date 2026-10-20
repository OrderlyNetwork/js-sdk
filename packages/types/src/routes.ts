import type { RouteOption } from "./context";

/**
 * Builders for the built-in destinations SDK pages emit through
 * `onRouteChange`. Hosts map these hrefs onto their own router (language
 * prefixes, query parameters, custom paths).
 */

/** `RouteOption.name` of the Perps trading page. */
export const PERP_ROUTE_NAME = "perps";
/** `RouteOption.name` of the Prediction page. */
export const PREDICTION_ROUTE_NAME = "prediction";

type RouteBuildOptions = Pick<RouteOption, "replace">;

function withOptions(route: RouteOption, options?: RouteBuildOptions) {
  return options?.replace == null
    ? route
    : { ...route, replace: options.replace };
}

/** Perps trading page of a market, e.g. `/perp/PERP_BTC_USDC`. */
export function perpRoute(
  symbol: string,
  options?: RouteBuildOptions,
): RouteOption {
  return withOptions(
    { href: `/perp/${encodeURIComponent(symbol)}`, name: PERP_ROUTE_NAME },
    options,
  );
}

/**
 * Prediction page of an exact round contract, e.g.
 * `/prediction/PERP_BTC5M2608271200_USDC`; without a symbol, the page entry
 * `/prediction` that selects the default round.
 */
export function predictionRoute(
  symbol?: string,
  options?: RouteBuildOptions,
): RouteOption {
  const href = symbol
    ? `/prediction/${encodeURIComponent(symbol)}`
    : "/prediction";
  return withOptions({ href, name: PREDICTION_ROUTE_NAME }, options);
}
