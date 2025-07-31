import { useCallback } from "react";
import { useNavigate } from "react-router";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { PathEnum } from "../constant";
import { getSymbol } from "../storage";
import { generateLocalePath } from "../utils";

export function useNav() {
  const navigate = useNavigate();

  const onRouteChange = useCallback(
    (option: RouteOption) => {
      if (option.target === "_blank") {
        window.open(option.href);
        return;
      }

      if (option.href === "/") {
        const symbol = getSymbol();
        navigate(generateLocalePath(`${PathEnum.Perp}/${symbol}`));
        return;
      }

      // if href not equal to the route path, we need to convert it to the route path
      const routeMap = {
        [PortfolioLeftSidebarPath.FeeTier]: PathEnum.FeeTier,
        [PortfolioLeftSidebarPath.ApiKey]: PathEnum.ApiKey,
      } as Record<string, string>;

      const path = routeMap[option.href] || option.href;

      navigate(generateLocalePath(path));
    },
    [navigate],
  );

  return { onRouteChange };
}
