import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath, getLocalePathFromPathname } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/types";
import { PathEnum } from "../constant";
import { migratePredictionPath } from "../navigationPaths";
import { getPerpSymbol } from "../perpSymbolStorage";

// if href not equal to the route path, we need to convert it to the route path
const routeMap: Record<PropertyKey, PathEnum> = {
  [PortfolioLeftSidebarPath.FeeTier]: PathEnum.FeeTier,
  [PortfolioLeftSidebarPath.ApiKey]: PathEnum.ApiKey,
};

export const useNav = () => {
  const navigate = useNavigate();

  const onRouteChange = useCallback(
    (option: RouteOption) => {
      if (option.target === "_blank") {
        window.open(option.href);
        return;
      }

      const path = migratePredictionPath(option.href);
      const mapped = routeMap[path] || path;
      const [pathnameAndSearch, ...hashParts] = mapped.split("#");
      const queryIndex = pathnameAndSearch.indexOf("?");
      const pathname =
        queryIndex < 0
          ? pathnameAndSearch
          : pathnameAndSearch.slice(0, queryIndex);
      const targetPath =
        pathname === "/"
          ? `${PathEnum.Perp}/${encodeURIComponent(getPerpSymbol())}`
          : pathname;
      const locale =
        typeof window !== "undefined"
          ? (getLocalePathFromPathname(window.location.pathname) ?? undefined)
          : undefined;
      const href =
        queryIndex < 0
          ? generatePath({ path: targetPath, locale })
          : generatePath({
              path: targetPath,
              locale,
              search: pathnameAndSearch.slice(queryIndex),
            });
      const hash = hashParts.length
        ? `#${hashParts.join("#")}`
        : typeof window !== "undefined"
          ? window.location.hash
          : "";
      navigate(`${href}${hash}`, { replace: option.replace });
    },
    [navigate],
  );

  return { onRouteChange };
};
