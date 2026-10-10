import { useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "@orderly.network/i18n";
import { formatSymbol, parseBinarySymbol } from "@orderly.network/utils";
import { PageTitleMap, PathEnum } from "../constant";
import { generatePageTitle } from "../utils";
import { usePathWithoutLang } from "./usePathWithoutLang";

/** update the page title when the path changes */
export function usePageTitle() {
  const params = useParams();
  const { t } = useTranslation();

  const path = usePathWithoutLang();

  useEffect(() => {
    let title = PageTitleMap[path as keyof typeof PageTitleMap];

    const symbol = params.symbol;
    if (path.startsWith(PathEnum.Perp) && symbol) {
      title = formatSymbol(symbol, "base-type");
    }

    if (path.startsWith(`${PathEnum.Prediction}/`)) {
      const market = parseBinarySymbol(params.symbol ?? "");
      title = market
        ? t("prediction.marketName", {
            base: market.base,
            period: market.period,
          })
        : PageTitleMap[PathEnum.Prediction];
    }

    document.title = generatePageTitle(title);
  }, [params, path, t]);
}
