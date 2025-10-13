import { useEffect, useState } from "react";
import {
  useAccount,
  useAccountInfo,
  useDebouncedCallback,
  useMutation,
} from "@kodiak-finance/orderly-hooks";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import { AccountStatusEnum } from "@kodiak-finance/orderly-types";
import { toast } from "@kodiak-finance/orderly-ui";

export type SettingScriptReturns = {
  maintenance_cancel_orders?: boolean;
  setMaintainConfig: (maintenance_cancel_order_flag: boolean) => void;
  isSetting: boolean;
  canTouch: boolean;
};

export const useSettingScript = (): SettingScriptReturns => {
  const { data, mutate: refresh } = useAccountInfo();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const [update, { isMutating }] = useMutation("/v1/client/maintenance_config");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(data?.maintenance_cancel_orders || false);
  }, [data]);

  const updateCheckState = useDebouncedCallback((value: boolean) => {
    // if (value === data?.maintenance_cancel_orders) return;
    update({
      maintenance_cancel_order_flag: value,
    }).then((data) => {
      if (data.success) {
        toast.success(value ? "Opened" : "Closed");
      } else {
        setChecked(!value);
      }
    });
  }, 300);

  const setMaintainConfig = (maintenance_cancel_order_flag: boolean) => {
    setChecked(maintenance_cancel_order_flag);
    updateCheckState(maintenance_cancel_order_flag);
  };
  const { state } = useAccount();

  const canTouch =
    !wrongNetwork &&
    !disabledConnect &&
    (state.status === AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected);

  return {
    maintenance_cancel_orders: checked, //data?.maintenance_cancel_orders,
    setMaintainConfig,
    isSetting: false,
    canTouch,
  };
};
