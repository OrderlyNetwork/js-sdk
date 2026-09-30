import { useMemo } from "react";
import { useQuery } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";

/**
 * `GET /v1/product_restricted_areas?product_type=BINARY` payload (user-service
 * tech spec §3.2). The envelope's `data` has no top-level `rows` array, so the
 * net layer returns it whole. Names are full country/city names, not ISO codes.
 */
type ProductRestrictedAreasBinaryResponse = {
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

const normalize = (value?: string) =>
  value?.replace(/[\s_-]+/g, "").toLowerCase();

/** Row fields are required strings; keeps `includes` arguments well-typed. */
const normalizeRowName = (value: string) =>
  value.replace(/[\s_-]+/g, "").toLowerCase();

/**
 * Frontend-only Binary region gate (user-service tech spec §3.3): restricts
 * trading for request IPs covered by the BINARY restricted-area list. City
 * rows take priority over country rows and must match both the city name and
 * the country name; country rows match the IP country (falling back to the
 * region field when the backend omits country). The order API performs the
 * authoritative server-side check and answers REGION_RESTRICTED regardless of
 * this UI gate, so matching failures fall open here. `visibility: "hidden"`
 * additionally hides the market entry — a navigation-level concern tracked
 * separately.
 */
export const useBinaryRegionRestricted = () => {
  const { data: restrictedAreas } =
    useQuery<ProductRestrictedAreasBinaryResponse>(
      "/v1/product_restricted_areas?product_type=BINARY",
      { revalidateOnFocus: false },
    );

  const { data: ipInfo } = useQuery<API.IpInfo>("/v1/ip_info", {
    revalidateOnFocus: false,
  });

  return useMemo(() => {
    const cityRows = restrictedAreas?.cities.rows;
    const countryRows = restrictedAreas?.countries.rows;
    if ((!cityRows?.length && !countryRows?.length) || !ipInfo) return false;

    const extendedIpInfo = ipInfo as API.IpInfo & { country?: string };
    const ipCountrySources = [extendedIpInfo.country, ipInfo.region]
      .map(normalize)
      .filter((value): value is string => !!value);
    const ipCity = normalize(ipInfo.city);

    const matchesCityRow = (
      row: ProductRestrictedAreasBinaryResponse["cities"]["rows"][number],
    ) => {
      if (!ipCity || normalizeRowName(row.name) !== ipCity) return false;
      // Disambiguate same-named cities across countries; when no country
      // source is available the city name match stands alone.
      return (
        ipCountrySources.length === 0 ||
        ipCountrySources.includes(normalizeRowName(row.country_name))
      );
    };

    if (cityRows?.some(matchesCityRow)) return true;

    return (
      countryRows?.some((row) =>
        ipCountrySources.includes(normalizeRowName(row.name)),
      ) ?? false
    );
  }, [restrictedAreas, ipInfo]);
};
