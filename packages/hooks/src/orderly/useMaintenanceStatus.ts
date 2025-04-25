import { useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useConfig } from "../useConfig";
import { useWS } from "../useWS";

const oneDay = 1000 * 60 * 60 * 24;

/** 0 for nothing,  2 for maintenance */
export enum MaintenanceStatus {
  None = 0,
  Maintenance = 2,
}

export function useMaintenanceStatus() {
  const [status, setStatus] = useState<number>(MaintenanceStatus.None);
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const [brokerName, setBrokerName] = useState<string>("Orderly network");
  const { data: systemInfo, mutate } = useQuery<any>(
    `/v1/public/system_info?source=maintenance`,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      errorRetryInterval: 200,
    }
  );
  const ws = useWS();

  const config = useConfig();

  useEffect(() => {
    if (!systemInfo) {
      return;
    }

    const brokerName = config.get("brokerName");
    if (brokerName) {
      setBrokerName(brokerName);
    }
    // systemInfo.status = 2;
    // systemInfo.scheduled_maintenance = {
    //   start_time: new Date("2024-08-27").getTime(),
    //   end_time: new Date("2024-08-30").getTime(),
    // };
    console.log("--systemInfo", systemInfo, brokerName);
    if (systemInfo.scheduled_maintenance) {
      setStartTime(systemInfo.scheduled_maintenance.start_time);
      setEndTime(systemInfo.scheduled_maintenance.end_time);
    }
    if (systemInfo.status === MaintenanceStatus.Maintenance) {
      setStatus(MaintenanceStatus.Maintenance);
    }
  }, [systemInfo, config]);

  useEffect(() => {
    const unsubscribe = ws.subscribe(`maintenance_status`, {
      onMessage: (message: any) => {
        setStatus(message.status);
        console.log("-- ws maintenance_status", message);
        if (message.scheduled_maintenance) {
          setStartTime(message.scheduled_maintenance.start_time);
          setEndTime(message.scheduled_maintenance.end_time);
        }
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return {
    status,
    brokerName,
    startTime,
    endTime,
  };
}
