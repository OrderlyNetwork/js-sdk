import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/types";
import { PathEnum } from "../constant";
import { getSymbol } from "../storage";

// if href not equal to the route path, we need to convert it to the route path
const routeMap: Record<PropertyKey, PathEnum> = {
  [PortfolioLeftSidebarPath.FeeTier]: PathEnum.FeeTier,
  [PortfolioLeftSidebarPath.ApiKey]: PathEnum.ApiKey,
};

export const useNav = () => {
  const navigate = useNavigate();

  const onRouteChange = useCallback(
    (option: RouteOption) => {
      if (option?.target === "_blank") {
        window.open(option.href);
        return;
      }

      if (option?.href === "/") {
        const symbol = getSymbol();
        navigate(generatePath({ path: `${PathEnum.Perp}/${symbol}` }));
        return;
      }

      const path = routeMap[option?.href!] || option?.href || "";
      const href = generatePath({ path });
      navigate(href);
    },
    [navigate],
  );

  return { onRouteChange };
};
