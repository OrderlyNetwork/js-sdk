import { useEffect } from "react";
import { useParams } from "react-router";
import { PageTitleMap, PathEnum } from "../../constant";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";
import { formatSymbol, generatePageTitle } from "../../utils";

export function PageTitle() {
  const params = useParams();

  const path = usePathWithoutLang();

  useEffect(() => {
    let title = PageTitleMap[path as keyof typeof PageTitleMap];

    const symbol = params.symbol;
    if (path.startsWith(PathEnum.Perp) && symbol) {
      title = generatePageTitle(formatSymbol(symbol));
    }

    document.title = generatePageTitle(title);
  }, [params, path]);

  return null;
}
