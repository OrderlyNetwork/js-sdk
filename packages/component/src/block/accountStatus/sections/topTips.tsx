import { useContext, useEffect, useState } from "react";
import { OrderlyAppContext } from "@/provider";
import {
  StatusContext,
  useMaintenanceStatus,
  WsNetworkStatus,
} from "@orderly.network/hooks";
import { WsStatus } from "@/block/accountStatus/sections/WsStatus";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { MaintenanceStatusTips } from "@/block/accountStatus/sections/maintenanceStatusTips";
import { MaintenanceDialog } from "@/block/accountStatus/sections/maintenanceDialog";

const oneDay = 1000 * 60 * 60 * 24;

export default function TopTips() {
  const [showMaintenanceTips, setShowMaintenanceTips] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const { errors } = useContext(OrderlyAppContext);
  const { status, startTime, endTime, brokerName } = useMaintenanceStatus();

  const { ws: wsStatus } = useContext(StatusContext);

  const { onSetChain } = useContext(OrderlyAppContext);
  useEffect(() => {
    if (status === 2) {
      setShowMaintenanceTips(false);
      setShowMaintenanceDialog(true);
      return;
    }
    setShowMaintenanceDialog(false);
    if (startTime) {
      if (startTime < new Date().getTime() + oneDay) {
        // check localstorage
        if (!window.localStorage.getItem(`Maintenance_${startTime}`)) {
          setShowMaintenanceTips(true);
        }
      }
    }
  }, [startTime, status]);

  if (showMaintenanceTips) {
    return (
      <MaintenanceStatusTips
        brokerName={brokerName}
        startTime={startTime ?? 0}
        endTime={endTime ?? 0}
        onClose={() => setShowMaintenanceTips(false)}
      />
    );
  }

  if (showMaintenanceDialog) {
    return (
      <MaintenanceDialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
        brokerName={brokerName}
        startTime={startTime ?? 0}
        endTime={endTime ?? 0}
      />
    );
  }

  if (wsStatus === WsNetworkStatus.Unstable) {
    return <WsStatus />;
  }
  // if (errors.ChainNetworkNotSupport) {
  //   return <ChainIdSwtich onSetChain={onSetChain} />;
  // }

  return <></>;
}
