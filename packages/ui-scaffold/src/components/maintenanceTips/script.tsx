import { useMaintenanceStatus } from "@orderly.network/hooks";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { UTCDateMini } from "@date-fns/utc";
function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}

export interface MaintenanceTipInterface {
  tipsContent: string;
  showTips: boolean;
  closeTips: () => void;
}

export const useMaintenanceScript = (): MaintenanceTipInterface => {
  const [showTips, setShowTips] = useState(false);
  const { startTime, endTime, status, brokerName } = useMaintenanceStatus();
  const startDate = useMemo(() => {
    if (!startTime) {
      return "-";
    }
    return getTimeString(startTime);
  }, [startTime]);
  const endDate = useMemo(() => {
    if (!endTime) {
      return "-";
    }
    return getTimeString(endTime);
  }, [endTime]);
  const closeTips = () => {
    window.localStorage.setItem(`Maintenance_${startTime}`, "1");
    setShowTips(false);
  };
  const tipsContent = `${brokerName} will be temporarily unavailable for a scheduled upgrade from ${startDate} to ${endDate}.`;
  return {
    tipsContent,
    showTips,
    closeTips,
  };
};
