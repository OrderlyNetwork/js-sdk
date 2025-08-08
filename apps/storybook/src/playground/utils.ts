import {
  i18n,
  parseI18nLang,
  getLocalePathFromPathname,
} from "@orderly.network/i18n";

export function generatePageTitle(title: string, suffix = "Orderly") {
  return `${title} | ${suffix}`;
}

export function formatSymbol(symbol: string, format = "base-type") {
  const arr = symbol.split("_");
  const type = arr[0];
  const base = arr[1];
  const quote = arr[2];

  return format
    .replace("type", type)
    .replace("base", base)
    .replace("quote", quote);
}

/**
 * Generate path
 * @param path - pathname
 * @param locale - if not provided, will use i18n.language
 * @param search - if not provided, will use window.location.search
 */
export function generatePath(params: {
  path: string;
  locale?: string;
  search?: string;
}) {
  const { path, locale, search } = params;
  const searchUrl =
    search || (typeof window !== "undefined" ? window.location.search : "");

  let localePath = getLocalePathFromPathname(path);

  // if path already has locale, return it
  if (localePath) {
    return `${path}${searchUrl}`;
  }

  localePath = locale || parseI18nLang(i18n.language);

  // if path doesn't have locale, add it
  return `/${localePath}${path}${searchUrl}`;
}
