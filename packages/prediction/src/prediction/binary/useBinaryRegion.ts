import { useProductRegionRestricted } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

/**
 * Frontend-only Binary region gate. The order API does not enforce region
 * restrictions, so every trading action must consume this gate. Both visible
 * and hidden rows keep the page and entry visible but disable trading —
 * `hidden` restricting trading without hiding the entry is an explicit
 * product decision (2026-10). Broker policy comes from
 * `restrictedInfo.predictionRegionRestriction`: it can disable the platform
 * list and add custom regions. Failing open on missing geo data is an explicit
 * product decision: unavailable geo data must not block trading.
 */
export const useBinaryRegionRestricted = (enabled = true) => {
  // The context default carries no restrictedInfo fields, hence the chaining.
  const { restrictedInfo } = useAppContext();
  const policy = restrictedInfo?.predictionRegionRestriction;
  return useProductRegionRestricted({
    platformAreasUrl: "/v1/product_restricted_areas?product_type=BINARY",
    customRegions: policy?.customRestrictedRegions,
    enableDefault: policy?.enableDefault,
    enabled,
  });
};
