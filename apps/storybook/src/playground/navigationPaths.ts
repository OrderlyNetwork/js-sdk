/** Rewrite only the legacy page segment, preserving encoded symbols and URL suffixes. */
export function migratePredictionPath(path: string): string {
  return path.replace(/^(\/[a-z]{2})?\/prediction(?=\/|[?#]|$)/, "$1/predict");
}

/** Preserve the full URL when adding the current language to a direct entry. */
export function localizeEntryPath(
  locale: string,
  location: { pathname: string; search: string; hash: string },
): string {
  return `/${locale}${migratePredictionPath(location.pathname)}${location.search}${location.hash}`;
}
