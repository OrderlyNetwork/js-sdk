import { useMemo } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { useQuery } from "../useQuery";
import { FlagKeys } from "./flagKeys";

/**
 * Feature flag item from API response
 */
export interface FeatureFlagItem {
  key: string;
  description: string;
}

/**
 * Return type for useFeatureFlag hook
 */
export interface UseFeatureFlagReturn {
  enabled: boolean;
  data: FeatureFlagItem | undefined;
}

/**
 * Hook to check if a feature flag is enabled
 *
 * Logic:
 * 1. Always query public API `/v1/public/feature-flags`
 * 2. If key is NOT in public API, return { enabled: false, data: undefined } (don't query private)
 * 3. If key IS in public API, query private API `/v1/feature-flags` (requires login)
 * 4. If key is in private API, return { enabled: true, data: FeatureFlagItem }
 * 5. If key is NOT in private API, return { enabled: false, data: undefined }
 *
 * @param key - The feature flag key to check
 * @returns { enabled: boolean, data: FeatureFlagItem | undefined }
 */
export const useFeatureFlag = (key: FlagKeys): UseFeatureFlagReturn => {
  // Always query public API
  const { data: publicFlags, isLoading: publicLoading } = useQuery<
    FeatureFlagItem[]
  >("/v1/public/feature-flags", {});

  // Find the key in public flags
  const publicFlag = useMemo(() => {
    if (!publicFlags || publicLoading) {
      return undefined;
    }
    return publicFlags.find((flag) => flag.key === key);
  }, [publicFlags, publicLoading, key]);

  // Only query private API if key is found in public API
  const shouldQueryPrivate = useMemo(() => {
    return publicFlag !== undefined;
  }, [publicFlag]);

  const { data: privateFlags, isLoading: privateLoading } = usePrivateQuery<
    FeatureFlagItem[]
  >(shouldQueryPrivate ? "/v1/feature-flags" : null, {});

  // Find the key in private flags
  const privateFlag = useMemo(() => {
    if (!shouldQueryPrivate || !privateFlags || privateLoading) {
      return undefined;
    }
    return privateFlags.find((flag) => flag.key === key);
  }, [shouldQueryPrivate, privateFlags, privateLoading, key]);

  // Return value based on the logic
  return useMemo(() => {
    // If key is not in public API, return false (don't check private)
    if (publicFlag === undefined) {
      return {
        enabled: false,
        data: undefined,
      };
    }

    // If key is in public API but not in private API, return false
    if (privateFlag === undefined) {
      return {
        enabled: false,
        data: undefined,
      };
    }

    // If key is in both public and private API, return true with data
    return {
      enabled: true,
      data: privateFlag,
    };
  }, [publicFlag, privateFlag, key]);
};
