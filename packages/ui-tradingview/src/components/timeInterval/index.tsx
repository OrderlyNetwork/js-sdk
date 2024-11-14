import {
  Box,
  cn,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
} from "@orderly.network/ui";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import React, { ReactNode, useMemo, useState } from "react";
import { CaretIcon } from "../../icons";

interface IProps {
  changeInterval: (interval: string) => void;
  interval: string;
}

const mobileTimeIntervalDefaultMap = [
  {
    value: "1",
    label: "1m",
  },
  {
    value: "15",
    label: "15m",
  },
  {
    value: "60",
    label: "1h",
  },
  {
    value: "240",
    label: "4h",
  },
  {
    value: "1D",
    label: "1D",
  },

  {
    value: "1W",
    label: "1W",
  },
];

const mobileTimeIntervalMoreMap = [
  [
    {
      value: "3",
      label: "3m",
    },
    {
      value: "5",
      label: "5m",
    },

    {
      value: "30",
      label: "30m",
    },

    {
      value: "120",
      label: "2h",
    },
  ],
  [
    {
      value: "360",
      label: "6h",
    },
    {
      value: "720",
      label: "12h",
    },
    {
      value: "3d",
      label: "3D",
    },
    {
      value: "1M",
      label: "1M",
    },
  ],
];


const timeIntervalMap = [
  {
    value: "1",
    label: "1m",
  },
  {
    value: "3",
    label: "3m",
  },
  {
    value: "5",
    label: "5m",
  },
  {
    value: "15",
    label: "15m",
  },
  {
    value: "30",
    label: "30m",
  },

  {
    value: "60",
    label: "1h",
  },

  {
    value: "240",
    label: "4h",
  },

  {
    value: "720",
    label: "12h",
  },
  {
    value: "1D",
    label: "1D",
  },

  {
    value: "1W",
    label: "1W",
  },
  {
    value: "1M",
    label: "1M",
  },
];

export function TimeInterval(props: IProps) {
  const isMobile = useMediaQuery(MEDIA_TABLET);
  if (isMobile) {
    return <MobileTimeInterval {...props} />;
  }
  return <DesktopTimeInterval {...props} />;
}

function DesktopTimeInterval(props: IProps) {
  return (
    <div className="oui-text-2xs oui-text-base-contrast-36 oui-flex oui-gap-[2px] oui-items-center oui-mr-3 oui-font-semibold">
      {timeIntervalMap.map((item) => (
        <div
          key={item.value}
          className={cn(
            "oui-cursor-pointer oui-px-2",
            "hover:oui-text-base-contrast-80",
            props.interval === item.value &&
              "oui-text-base-contrast-80 oui-bg-white/[.06] oui-rounded"
          )}
          id={item.value}
          onClick={() => props.changeInterval(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function MobileTimeInterval(props: IProps) {
  const currentIntervalIsInExpand = useMemo(() => {
    for (const row of mobileTimeIntervalMoreMap) {
      for (const item of row) {
        if (item.value === props.interval){
          return item.label;
        }
      }
    }
    return null;
  }, [props.interval])
  return (
    <Flex justify="start" itemAlign="center" gap={3} className='oui-text-2xs oui-text-base-contrast-36'>
      <div className=" oui-flex oui-gap-1 oui-items-center oui-mr-3 oui-font-semibold">
        {mobileTimeIntervalDefaultMap.map((item) => (
          <div
            className={cn(
              "oui-px-2",
              props.interval === item.value &&
                "oui-text-base-contrast-80 oui-bg-white/[.06] oui-rounded"
            )}
            key={item.value}
            onClick={() => props.changeInterval(item.value)}
          >
            {item.label}
          </div>
        ))}
      </div>

      <DropDownTimeInterval {...props}>
        {currentIntervalIsInExpand ?
          <div className='oui-text-base-contrast-80'>

            {currentIntervalIsInExpand}
        </div> :
          <Text>More</Text>
        }

      </DropDownTimeInterval>
    </Flex>
  );
}

function DropDownTimeInterval(props: IProps & { children: ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className='oui-flex oui-justify-start oui-items-center oui-gap-0.5'>

        {props.children}
        <CaretIcon
          className={cn(
            "oui-w-3 oui-h-3",
            open && "oui-text-base-contrast-80 oui-rotate-180"
          )}
        />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="start"
          alignOffset={0}
          sideOffset={0}
          className={cn(
            "oui-markets-dropdown-menu-content oui-bg-base-9 oui-w-screen oui-flex oui-flex-col oui-gap-2 oui-p-3"
          )}
        >
          {mobileTimeIntervalMoreMap.map((row, id) => (
            <div className="oui-flex oui-gap-2" key={id}>
              {row.map((item) => (
                <div
                  className={cn(
                    "oui-w-full  oui-text-2xs oui-flex oui-items-center oui-justify-center oui-h-6  oui-rounded",
                    item.value === props.interval
                      ? "oui-text-base-contrast oui-bg-primary-darken"
                      : "oui-text-base-contrast-36 oui-bg-base-5"
                  )}
                  key={item.value}
                  onClick={() => {
                    props.changeInterval(item.value);
                  }}
                >
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
}
