import type { API } from "@orderly.network/types";

/** Geo fields consumed by the matcher; API.IpInfo is structurally assignable. */
export type ProductRegionIpInfo = {
  country?: string;
  region?: string;
  city?: string;
};

const normalize = (value?: string) =>
  value?.replace(/[\s_-]+/g, "").toLowerCase();

/**
 * Product-scoped region gate, frontend-only.
 *
 * Platform rows keep the prediction gate semantics: city rows require both
 * city and country to match, `visible` and `hidden` rows both restrict trading
 * while keeping the product visible. Custom entries are plain region/city
 * names (same format as the site-wide `customRestrictedRegions`) matched
 * against the IP region or city, and unioned with any supplied platform list.
 *
 * Failing open on missing geo data is an explicit product decision:
 * unavailable data must not block trading.
 */
export const isProductRegionRestricted = (options: {
  platformAreas?: API.ProductRestrictedAreasResponse | null;
  ipInfo?: ProductRegionIpInfo | null;
  customRegions?: string[];
}): boolean => {
  const { platformAreas, ipInfo, customRegions } = options;
  if (!ipInfo) return false;

  const regions = [ipInfo.region, ipInfo.city]
    .map(normalize)
    .filter((value): value is string => !!value);
  const normalizedCustom = (customRegions ?? [])
    .map(normalize)
    .filter((value): value is string => !!value);
  if (normalizedCustom.some((entry) => regions.includes(entry))) {
    return true;
  }

  if (!platformAreas) return false;
  const countries = [ipInfo.country, ipInfo.region]
    .map(normalize)
    .filter((value): value is string => !!value);
  const city = normalize(ipInfo.city);
  if (
    city &&
    platformAreas.cities.rows.some(
      (row) =>
        normalize(row.name) === city &&
        countries.includes(normalize(row.country_name) ?? ""),
    )
  ) {
    return true;
  }
  return platformAreas.countries.rows.some((row) =>
    countries.includes(normalize(row.name) ?? ""),
  );
};
