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
 * Generate path with locale
 * @param path - path to generate
 * @returns path with locale
 */
export function generateLocalePath(path: string) {
  let localePath = getLocalePathFromPathname(path);

  // if path already has locale, return it
  if (localePath) {
    return path;
  }

  localePath = parseI18nLang(i18n.language);

  // if path doesn't have locale, add it
  return `/${localePath}${path}`;
}
