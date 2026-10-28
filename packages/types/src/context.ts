/**
 * Navigation request emitted by SDK widgets for in-app route changes,
 * e.g. Perps <-> Prediction switches or links to portfolio pages.
 */
export type RouteOption = {
  /**
   * In-app path to navigate to, e.g. `/perp/PERP_BTC_USDC` or
   * `/prediction/PERP_BTC5M2608271200_USDC`. Prediction hrefs keep the legacy
   * `/prediction` prefix; hosts map or redirect them onto `/predict`.
   */
  href: string;
  /** Display name or identifier of the destination route. */
  name: string;
  /** Where the navigation was triggered from, e.g. `"leftNav"`. */
  scope?: string;
  /** Open the target elsewhere, e.g. `"_blank"` for external links. */
  target?: string;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
};

/**
 * Bridges SDK navigation intents to the host router. Pass `onRouteChange`
 * to `OrderlyAppProvider`; SDK pages route every internal navigation through
 * it and expect the host to map `option.href` onto its own router. Leaving
 * it undefined disables SDK-initiated navigation (e.g. the Prediction market
 * dropdown stops offering cross-page selection).
 */
export type RouterAdapter = {
  onRouteChange: (option: RouteOption) => void;
  /** Current in-app path, used to highlight the active navigation item. */
  currentPath?: string;
};
