import { useMemo } from "react";
import type { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";
import {
  isProductRegionRestricted,
  type ProductRegionIpInfo,
} from "./productRegion";

export interface UseProductRegionRestrictedOptions {
  /**
   * Platform restricted-areas endpoint, e.g.
   * `/v1/product_restricted_areas?product_type=BINARY`. Omit for products
   * without a platform-side list — the gate then matches custom
   * regions only and fires no platform request.
   */
  platformAreasUrl?: string;
  /**
   * Broker-side extra restricted region/city names, unioned with the platform
   * list when enableDefault is true. Keeps the product visible; only trading
   * is disabled.
   */
  customRegions?: string[];
  /** Whether to apply the platform list; defaults to true. */
  enableDefault?: boolean;
  /** Gate the underlying queries; defaults to true. */
  enabled?: boolean;
}

/**
 * Frontend-only product region gate. The order API does not enforce region
 * restrictions, so trading actions must consume this gate themselves.
 * Fails open when the geo lookup is unavailable.
 */
export const useProductRegionRestricted = (
  options: UseProductRegionRestrictedOptions = {},
) => {
  const {
    platformAreasUrl,
    customRegions,
    enableDefault = true,
    enabled = true,
  } = options;
  const { data: platformAreas } = useQuery<API.ProductRestrictedAreasResponse>(
    enabled && enableDefault && platformAreasUrl ? platformAreasUrl : null,
    { revalidateOnFocus: false },
  );
  const { data: ipInfo } = useQuery<ProductRegionIpInfo>(
    enabled ? "/v1/ip_info" : null,
    { revalidateOnFocus: false },
  );
  return useMemo(
    () =>
      isProductRegionRestricted({
        platformAreas: enableDefault ? platformAreas : undefined,
        ipInfo,
        customRegions,
      }),
    [platformAreas, ipInfo, customRegions, enableDefault],
  );
};
