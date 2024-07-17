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

export const useApiKeyManager = () => {
  const { account } = useAccount();

  const { data, mutate, error, isLoading } = usePrivateQuery<APIKeyItem[]>(
    "/v1/client/key_info?page=1&size=999&key_status=ACTIVE",
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

  const removeOrderkyKey = useCallback((orderly_key: string): Promise<any> => {
    return doRemoveOrderKey({
      orderly_key,
    });
  }, []);

  const generateOrderlyKey = (scope?: string): Promise<any> => {
    return account?.createOrderlyKey(365, {
        tag: "manualCreated",
        scope
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
      removeOrderkyKey,
    },
  ] as const;
};
