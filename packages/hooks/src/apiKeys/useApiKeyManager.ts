import { useCallback } from "react";
import { useMutation } from "../useMutation";
import { useAccount } from "../useAccount";
import { usePrivateQuery } from "../usePrivateQuery";

export type APIKeyItem = {
  orderly_key: string;
  key_status: string;
  ip_restriction_list: string[];
  ip_restricion_status: string;
  expiration: number;
  tag?: any;
  scope?: string;
};

export enum ScopeType {
  trade = "trade",
  trading = "trading",
  tradeAndTrading = "trade,trading",
}

export const useApiKeyManager = (queryParams?: {
  keyInfo?: {
    page?: number;
    size?: number;
    keyStatus?: string;
  };
}) => {
  const { account } = useAccount();
  const { keyInfo } = queryParams || {};

  const keyInfoPrams = getQueryParamsFromObject(keyInfo);

  const { data, mutate, error, isLoading } = usePrivateQuery<APIKeyItem[]>(
    `/v1/client/key_info${keyInfoPrams.length > 0 ? `?${keyInfoPrams}` : ''}`,
    {
      formatter: (data) => data?.rows,
    }
  );

  const [doIPRestriction] = useMutation(
    "/v1/client/set_orderly_key_ip_restriction",
    "POST"
  );

  const [doRemoveOrderKey] = useMutation(
    "/v1/client/remove_orderly_key",
    "POST"
  );

  const [doResetIPRestriction] = useMutation(
    '/v1/client/reset_orderly_key_ip_restriction',
    "POST",
  );

  /**  ip_restriction_list is ["192.168.1.1", "192.168.1.2"].join(",") */
  const setIPRestriction = useCallback(
    (orderly_key: string, ip_restriction_list: string): Promise<any> => {
      return doIPRestriction({
        orderly_key,
        ip_restriction_list,
      });
    },
    []
  );

  const removeOrderlyKey = useCallback((orderly_key: string): Promise<any> => {
    return doRemoveOrderKey({
      orderly_key,
    });
  }, []);

  const generateOrderlyKey = (
    scope?: ScopeType
  ): Promise<{
    key: string;
    secretKey: string;
  }> => {
    return account?.createApiKey(365, {
      tag: "manualCreated",
      scope,
    });
  };


  const resetOrderlyKeyIPRestriction = (orderlyKey: string, mode: "ALLOW_ALL_IPS" | "DISALLOW_ALL_IPS") => {
    return doResetIPRestriction({
      orderly_key: orderlyKey,
      reset_mode: mode,
    });
  };
  return [
    data,
    {
      refresh: mutate,
      error,
      isLoading,
      generateOrderlyKey,
      setIPRestriction,
      removeOrderlyKey,
      resetOrderlyKeyIPRestriction,
    },
  ] as const;
};


function getQueryParamsFromObject(obj?: Record<string, any>): string {
  if (typeof obj === 'undefined') return '';
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          queryParams.append(key, item.toString());
        });
      } else {
        queryParams.set(key, value.toString());
      }
    }
  }

  return queryParams.toString();
}