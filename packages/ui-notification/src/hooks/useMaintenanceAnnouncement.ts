import { useCallback, useEffect, useMemo } from "react";
import {
  MaintenanceStatus,
  useLocalStorage,
  useMaintenanceStatus,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AnnouncementType } from "@orderly.network/types";
import type { AnnouncementSummary } from "../types";
import { getTimeString } from "../utils";

/**
 * Reads maintenance reminders independently of ordinary announcement visibility.
 * @returns Maintenance-only tips, an optional localized maintenanceDialogInfo message,
 * showAnnouncement visibility and closeTips to dismiss the reminder.
 */
export function useMaintenanceAnnouncement() {
  const { t } = useTranslation();
  const { startTime, endTime, status, brokerName } = useMaintenanceStatus();
  const [store, setStore] = useLocalStorage<{
    show?: boolean;
    lastUpdateTime?: number;
  }>("orderly_announcement", {});
  const maintenanceDialogInfo =
    status === MaintenanceStatus.Maintenance
      ? t("maintenance.dialog.description", {
          brokerName,
          endDate: endTime ? getTimeString(endTime) : "-",
        })
      : undefined;
  const maintenances = useMemo<AnnouncementSummary[]>(
    () =>
      startTime && endTime
        ? [
            {
              announcement_id: "-1",
              type: AnnouncementType.Maintenance,
              startTime,
              endTime,
              updated_time: startTime,
              message: t("maintenance.tips.description", {
                brokerName,
                startDate: getTimeString(startTime),
                endDate: getTimeString(endTime),
              }),
            },
          ]
        : [],
    [startTime, endTime, brokerName, t],
  );

  useEffect(() => {
    if (startTime && endTime && (store.lastUpdateTime ?? 0) < startTime) {
      setStore({ show: true, lastUpdateTime: startTime });
    }
  }, [startTime, endTime, store.lastUpdateTime, setStore]);
  const closeTips = useCallback(
    () => setStore({ ...store, show: false }),
    [store, setStore],
  );
  return {
    tips: maintenances,
    maintenanceDialogInfo,
    showAnnouncement: !!store.show && maintenances.length > 0,
    closeTips,
  };
}
