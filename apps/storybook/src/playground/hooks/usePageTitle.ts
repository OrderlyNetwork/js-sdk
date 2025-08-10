import { useEffect } from "react";
import { useParams } from "react-router";
import { formatSymbol } from "@orderly.network/utils";
import { PageTitleMap, PathEnum } from "../constant";
import { generatePageTitle } from "../utils";
import { usePathWithoutLang } from "./usePathWithoutLang";

/** update the page title when the path changes */
export function usePageTitle() {
  const params = useParams();

  const path = usePathWithoutLang();

  useEffect(() => {
    let title = PageTitleMap[path as keyof typeof PageTitleMap];

    const symbol = params.symbol;
    if (path.startsWith(PathEnum.Perp) && symbol) {
      title = formatSymbol(symbol, "base-type");
    }

    document.title = generatePageTitle(title);
  }, [params, path]);
}
