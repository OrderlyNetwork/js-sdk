import { useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "@orderly.network/i18n";
import { formatSymbol } from "@orderly.network/utils";
import { PageTitleMap, PathEnum } from "../constant";
import { generatePageTitle } from "../utils";
import { usePathWithoutLang } from "./usePathWithoutLang";

const PREDICTION_MARKET_ID_PATTERN =
  /^PERP_([A-Z0-9]+?)(5M|10M|15M)_[A-Z0-9]+$/;

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
      const market = PREDICTION_MARKET_ID_PATTERN.exec(params.marketId ?? "");
      title = market
        ? t("prediction.marketName", { base: market[1], period: market[2] })
        : PageTitleMap[PathEnum.Prediction];
    }

    document.title = generatePageTitle(title);
  }, [params, path, t]);
}
