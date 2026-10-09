export type ProductRestrictedAreasBinaryResponse = {
  product_type: string;
  countries: {
    rows: { name: string; visibility: "visible" | "hidden" }[];
  };
  cities: {
    rows: {
      name: string;
      country_name: string;
      visibility: "visible" | "hidden";
    }[];
  };
};

type BinaryIpInfo = { country?: string; region?: string; city?: string };

const normalize = (value?: string) =>
  value?.replace(/[\s_-]+/g, "").toLowerCase();

/**
 * Both visibility values restrict trading while keeping the product visible;
 * not hiding the entry for `hidden` rows is an explicit product decision.
 */
export const isBinaryRegionRestricted = (
  restrictedAreas?: ProductRestrictedAreasBinaryResponse,
  ipInfo?: BinaryIpInfo,
) => {
  // Product decision (2026-10): fail open when the restricted-areas list or
  // the geo lookup is unavailable — missing data must not block trading,
  // even though this gate is the only enforcement for BINARY.
  if (!restrictedAreas || !ipInfo) return false;
  const countries = [ipInfo.country, ipInfo.region]
    .map(normalize)
    .filter((value): value is string => !!value);
  const city = normalize(ipInfo.city);

  if (
    city &&
    restrictedAreas.cities.rows.some(
      (row) =>
        normalize(row.name) === city &&
        countries.includes(normalize(row.country_name) ?? ""),
    )
  ) {
    return true;
  }
  return restrictedAreas.countries.rows.some((row) =>
    countries.includes(normalize(row.name) ?? ""),
  );
};
