import { useMaintenanceStatus } from "@orderly.network/hooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { UTCDateMini } from "@date-fns/utc";
import { getTimestamp } from "@orderly.network/utils";
function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}

const oneDay = 1000 * 60 * 60 * 24;

export interface MaintenanceTipInterface {
  tipsContent: string;
  showTips: boolean;
  closeTips: () => void;
  showDialog: boolean;
  dialogContent?: string;
}

export const useMaintenanceScript = (): MaintenanceTipInterface => {
  const [showTips, setShowTips] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
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

  useEffect(() => {
    console.log('-- start time', {
      startTime,
      status,
    });
    if (status === 2) {
      setShowTips(false);
      setShowDialog(true);
      return;
    }
    setShowDialog(false);
    if (startTime) {
      if (startTime < getTimestamp() + oneDay) {
        // check localstorage
        if (!window.localStorage.getItem(`Maintenance_${startTime}`)) {
          setShowTips(true);
        }
      }
    }
  }, [startTime, status]);
  const tipsContent = `${brokerName} will be temporarily unavailable for a scheduled upgrade from ${startDate} to ${endDate}.`;
  const dialogContent = `Sorry, ${brokerName} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by ${endDate}.`;
  return {
    tipsContent,
    showTips,
    closeTips,
    showDialog,
    dialogContent,
  };
};
