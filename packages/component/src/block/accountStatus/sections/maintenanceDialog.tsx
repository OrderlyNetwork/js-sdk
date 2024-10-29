import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog";
import { useMemo } from "react";
import { format } from "date-fns";
import { UTCDateMini } from "@date-fns/utc";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokerName: string;
  startTime: number;
  endTime: number;
}

function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}
export function MaintenanceDialog({
  brokerName,
  endTime,
  open,
  onOpenChange,
}: IProps) {
  const endDate = useMemo(() => {
    return getTimeString(endTime);
  }, [endTime]);
  return (
    <Dialog open={open}>
      <DialogContent
        closable={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="orderly-text-xs  orderly-font-semibold desktop:!orderly-text-base">
            System upgrade in progress
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="orderly-flex orderly-gap-1 orderly-font-semibold orderly-text-base-contrast-54 orderly-pt-5 orderly-text-2xs desktop:!orderly-text-xs">
            Sorry, {brokerName} is temporarily unavailable due to a scheduled
            upgrade. The service is expected to be back by {endDate}.
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
