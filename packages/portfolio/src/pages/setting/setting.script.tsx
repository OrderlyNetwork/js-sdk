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
import { useContext, useEffect, useState } from "react";

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
  const [checked, setChecked] = useState(false);
  const value = useDebounce(checked, 300);
  useEffect(() => {
    if (value === data?.maintenance_cancel_orders) return;
    update({
      maintenance_cancel_order_flag: value,
    }).then((data) => {
      if (data.success) {
        toast.success(value ? "Opened" : "Closed");
        refresh();
      }
    });
    
  }, [value, data]);
  const setMaintainConfig = (maintenance_cancel_order_flag: boolean) => {
    
    setChecked(maintenance_cancel_order_flag);
  };
  const { state } = useAccount();
  
  return {
    maintenance_cancel_orders: checked,//data?.maintenance_cancel_orders,
    setMaintainConfig,
    isSetting: false,
    canTouch: state.status === AccountStatusEnum.EnableTrading
  };
};




export function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;