import { useEffect, useState } from "react";
import {
  useAccount,
  useAccountInfo,
  useDebouncedCallback,
  useMutation,
  useLocalStorage,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";

const ORDERLY_ORDER_SOUND_ALERT_KEY = "orderly_order_sound_alert";

const ORDERLY_MWEB_ORDER_ENTRY_SIDE_MARKETS_LAYOUT =
  "orderly_mweb_order_entry_side_markets_layout";

export type OrderPanelLayout = "left" | "right";

export type SettingScriptReturns = {
  maintenance_cancel_orders?: boolean;
  setMaintainConfig: (maintenance_cancel_order_flag: boolean) => void;
  isSetting: boolean;
  canTouch: boolean;
  soundAlert: boolean;
  setSoundAlert: (value: boolean) => void;
  hasOrderFilledMedia: boolean;
  orderPanelLayout: OrderPanelLayout;
  setOrderPanelLayout: (v: OrderPanelLayout) => void;
};

export const useSettingScript = (): SettingScriptReturns => {
  const { data, mutate: refresh } = useAccountInfo();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const [update, { isMutating }] = useMutation("/v1/client/maintenance_config");
  const [checked, setChecked] = useState(false);
  const { notification } = useOrderlyContext();

  const [soundAlert, setSoundAlert] = useLocalStorage<boolean>(
    ORDERLY_ORDER_SOUND_ALERT_KEY,
    notification?.orderFilled?.defaultOpen ?? false,
  );

  const [orderPanelLayout, setOrderPanelLayout] =
    useLocalStorage<OrderPanelLayout>(
      ORDERLY_MWEB_ORDER_ENTRY_SIDE_MARKETS_LAYOUT,
      "right",
    );

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
    soundAlert,
    setSoundAlert,
    hasOrderFilledMedia: Boolean(notification?.orderFilled?.media),
    orderPanelLayout,
    setOrderPanelLayout,
  };
};
