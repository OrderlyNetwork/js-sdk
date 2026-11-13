import { useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "../provider/appStateContext";

export const ORDERLY_ORDER_NOTIFICATIONS_KEY =
  "orderly_order_notifications_enabled";

/**
 * Browser preference for order status popups.
 *
 * The stored preference only applies while the host exposes the switch via
 * `widgetConfigs.setting.showOrderNotifications`; otherwise popups stay on, so
 * users are never left with notifications disabled and no way to re-enable them.
 */
export const useOrderNotificationsEnabled = () => {
  const { widgetConfigs } = useAppContext();
  const configurable = widgetConfigs?.setting?.showOrderNotifications === true;
  const [stored, setEnabled] = useLocalStorage<boolean>(
    ORDERLY_ORDER_NOTIFICATIONS_KEY,
    true,
  );
  return {
    configurable,
    enabled: !configurable || stored !== false,
    setEnabled,
  };
};
