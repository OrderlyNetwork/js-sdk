import { useMemo } from "react";
import { useQuery } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import {
  isBinaryRegionRestricted,
  type ProductRestrictedAreasBinaryResponse,
} from "./binaryRegion";

/**
 * Frontend-only Binary region gate. The order API does not enforce region
 * restrictions, so every trading action must consume this gate. Both visible
 * and hidden rows keep the page and entry visible but disable trading —
 * `hidden` restricting trading without hiding the entry is an explicit
 * product decision (2026-10). City restrictions require both city and
 * country names. Failing open on missing IP or restricted-areas data is
 * an explicit product decision: unavailable geo data must not block trading.
 */
export const useBinaryRegionRestricted = (enabled = true) => {
  // The response has no top-level rows, so the net layer keeps the full data.
  const { data: restrictedAreas } =
    useQuery<ProductRestrictedAreasBinaryResponse>(
      enabled ? "/v1/product_restricted_areas?product_type=BINARY" : null,
      { revalidateOnFocus: false },
    );
  const { data: ipInfo } = useQuery<API.IpInfo>(
    enabled ? "/v1/ip_info" : null,
    {
      revalidateOnFocus: false,
    },
  );

  return useMemo(
    () => isBinaryRegionRestricted(restrictedAreas, ipInfo),
    [restrictedAreas, ipInfo],
  );
};
