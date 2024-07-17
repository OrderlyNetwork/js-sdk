import {
  APIKeyItem,
  OrderlyContext,
  ScopeType,
  useAccount,
  useAccountInfo,
  useApiKeyManager,
  useMutation,
  useQuery,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { useContext, useState } from "react";

export type SettingScriptReturns = {
  maintenance_cancel_orders?: boolean;
  setMaintainConfig: (maintenance_cancel_order_flag: boolean) => void;
  isSetting: boolean;
  canTouch: boolean; 
};

export const useSettingScript = (): SettingScriptReturns => {
  const { data, mutate: refresh } = useAccountInfo();
  const [update, {
    isMutating
  }] = useMutation("/v1/client/maintenance_config");
  const setMaintainConfig = (maintenance_cancel_order_flag: boolean) => {
    
    update({
      maintenance_cancel_order_flag,
    }).then((data) => {
      if (data.success) {
        toast.success("success");
        refresh();
      }
    });
  };
  const { state } = useAccount();
  
  return {
    maintenance_cancel_orders: data?.maintenance_cancel_orders,
    setMaintainConfig,
    isSetting: isMutating,
    canTouch: state.status === AccountStatusEnum.EnableTrading
  };
};
