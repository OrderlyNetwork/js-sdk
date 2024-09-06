import { cn } from "@orderly.network/ui";

interface IProps {
  changeInterval: (interval: string) => void;
  interval: string;
}

const timeIntervalMap = [
  {
    value: "1",
    label: "1m"
  },
  {
    value: "3",
    label: "3m"
  },
  {
    value: "5",
    label: "5m"
  },
  {
    value: "15",
    label: "15m"
  },
  {
    value: "30",
    label: "30m"
  },

  {
    value: "60",
    label: "1h"
  },

  {
    value: "240",
    label: "4h"
  },

  {
    value: "720",
    label: "12h"
  },
  {
    value: "1D",
    label: "1D"
  },

  {
    value: "1W",
    label: "1W"
  },
  {
    value: "1M",
    label: "1M",
  },
];

export default function TimeInterval (props: IProps) {
  return (
    <div className="oui-text-2xs oui-text-base-contrast-54 oui-flex oui-gap-[2px] oui-items-center oui-mr-3 oui-font-semibold">
      {timeIntervalMap.map((item) => (
        <div
          key={item.value}
          className={cn(
            "oui-cursor-pointer oui-px-2",
            props.interval === item.value && "oui-text-base-contrast-80 oui-bg-white/[.06] oui-rounded"
          )}
          id={item.value}
          onClick={() => props.changeInterval(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  )

}




