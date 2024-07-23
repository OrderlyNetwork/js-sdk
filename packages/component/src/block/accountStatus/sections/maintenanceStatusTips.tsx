import { cn } from "@/utils";
import { CloseIcon, InfoIcon } from "@/icon";
import { CloseSmallIcon } from "@/icon/icons/closeSmall";
import { UTCDateMini } from "@date-fns/utc";
import { format } from "date-fns";
import { useMemo } from "react";

function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}

interface IProps {
  brokerName: string;
  startTime: number;
  endTime: number;
  onClose: () => void;
}
export function MaintenanceStatusTips({
  brokerName,
  startTime,
  endTime,
  onClose,
}: IProps) {
  const startDate = useMemo(() => {
    return getTimeString(startTime);
  }, [startTime]);
  const endDate = useMemo(() => {
    return getTimeString(endTime);
  }, [endTime]);
  const onCloseTips = () => {
    window.localStorage.setItem(`Maintenance_${startTime}`, "1");
    onClose();
  };
  return (
    <div
      className={cn(
        "orderly-bg-warning-darken orderly-text-warning orderly-text-2xs orderly-font-semibold orderly-leading-[18px]",
        "orderly-fixed orderly-left-0 orderly-right-0 orderly-z-[30]",
        "orderly-flex orderly-gap-2 orderly-items-start orderly-bottom-[64px] orderly-p-[10px] orderly-pr-[44px]",
        "orderly-font-semibold",
        "desktop:!orderly-flex desktop:!orderly-gap-1 desktop:!orderly-items-center desktop:!orderly-justify-center desktop:!orderly-static desktop:!orderly-h-[40px] desktop:!orderly-text-xs desktop:!orderly-bottom-0 desktop:!orderly-pr-0"
      )}
    >
      <InfoIcon
        size={20}
        className="orderly-flex-shrink-0 orderly-w-4 orderly-h-4 desktop:!orderly-w-5 desktop:!orderly-h-5"
      />
      <div>
        {brokerName} will be temporarily unavailable for a scheduled upgrade
        from&nbsp;
        {startDate} to {endDate}.
      </div>
      <CloseSmallIcon
        size={24}
        className="orderly-absolute orderly-right-4 orderly-text-[# orderly-opacity-[.36] hover:orderly-opacity-[.98] orderly-cursor-pointer absolut-item-center"
        onClick={onCloseTips}
      />
    </div>
  );
}
