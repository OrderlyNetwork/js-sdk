import { useCallback } from "react";
import { RouteOption } from "@orderly.network/ui-scaffold";
// https://github.com/storybookjs/storybook/tree/next/code/addons/links
// linkTo is not working, so use navigate instead
import { navigate } from "@storybook/addon-links";

export function useNav() {
  const onRouteChange = useCallback((option: RouteOption) => {
    if (option.target === "_blank") {
      window.open(option.href);
      return;
    }

    const name = "Layout Page";

    const routeMap = {
      "/": {
        storyId: "Package/trading/TradingPage",
        name: "Page",
      },
      "/portfolio": "Package/portfolio/Overview",
      "/portfolio/feeTier": "Package/portfolio/FeeTier",
      "/portfolio/apiKey": "Package/portfolio/ApiKey",
      "/portfolio/positions": "Package/portfolio/Positions",
      "/portfolio/orders": "Package/portfolio/Orders",
      "/portfolio/setting": "Package/portfolio/Setting",
      "/markets": "Package/markets/HomePage",
      "/rewards": "Package/trading-rewards",
      "/rewards/trading": "Package/trading-rewards",
      "/rewards/affiliate": "Package/affiliate/Dashboard",
    } as Record<string, { storyId: string; name?: string } | string>;

    const params = routeMap[option.href];

    navigate(typeof params === "string" ? { storyId: params, name } : params);
  }, []);

  return { onRouteChange };
}
