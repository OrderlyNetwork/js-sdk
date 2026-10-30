import { useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "@orderly.network/i18n";
import { formatBinarySymbolName } from "@orderly.network/prediction";
import { formatSymbol } from "@orderly.network/utils";
import { PageTitleMap, PathEnum } from "../constant";
import { generatePageTitle } from "../utils";
import { usePathWithoutLang } from "./usePathWithoutLang";

/** update the page title when the path changes */
export function usePageTitle() {
  const params = useParams();
  const { i18n: i18nInstance } = useTranslation();

  const path = usePathWithoutLang();

  useEffect(() => {
    let title = PageTitleMap[path as keyof typeof PageTitleMap];

    const symbol = params.symbol;
    if (path.startsWith(PathEnum.Perp) && symbol) {
      title = formatSymbol(symbol, "base-type");
    }
    if (path.startsWith(`${PathEnum.Announcement}/`)) {
      title = PageTitleMap[PathEnum.Announcement];
    }

    if (path.startsWith(`${PathEnum.Prediction}/`)) {
      title =
        formatBinarySymbolName(symbol) ?? PageTitleMap[PathEnum.Prediction];
    }

    document.title = generatePageTitle(title);
  }, [params, path, i18nInstance.language]);
}
