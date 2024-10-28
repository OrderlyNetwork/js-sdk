import React, { ReactNode, useRef, useState } from "react";
import { DisplayControlSettingInterface } from "../../type";
import {
  Box,
  Checkbox,
  Divider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
  cn,
  Switch,
} from "@orderly.network/ui";
import {
  CaretIcon,
  DisplaySettingIcon,
  SelectedIcon,
  UnSelectIcon,
} from "../../icons";

const DisplayControlMap: {
  label: string;
  id: keyof DisplayControlSettingInterface;
}[] = [
  {
    label: "Position",
    id: "position",
  },
  // {
  //   label: "Buy/Sell",
  //   id: "buySell",
  // },
  {
    label: "Limit Orders",
    id: "limitOrders",
  },
  {
    label: "Stop orders",
    id: "stopOrders",
  },
  {
    label: "TP/SL",
    id: "tpsl",
  },
  {
    label: "Position TP/SL",
    id: "positionTpsl",
  },
];

const MobileDisplayControlMap: {
  label: string;
  id: keyof DisplayControlSettingInterface;
}[][] = [
  [
    {
      label: "Position",
      id: "position",
    },

    {
      label: "Limit Orders",
      id: "limitOrders",
    },
  ],
  [
    {
      label: "Stop orders",
      id: "stopOrders",
    },
    {
      label: "TP/SL",
      id: "tpsl",
    },
  ],
  [
    {
      label: "Position TP/SL",
      id: "positionTpsl",
    },
    {
      label: "Buy/Sell",
      id: "buySell",
    },
  ],
];

interface IProps {
  displayControlState: DisplayControlSettingInterface;
  changeDisplayControlState: (state: DisplayControlSettingInterface) => void;
}

export function DesktopDisplayControl({
  displayControlState,
  changeDisplayControlState,
}: IProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenuRoot open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Flex
            justify="start"
            itemAlign="center"
            className="oui-gap-[2px] oui-cursor-pointer oui-text-base-contrast-36  hover:oui-text-base-contrast-80"
          >
            <DisplaySettingIcon
              className={cn(
                "oui-w-[18px] oui-h-[18px] ",
                open && "oui-text-base-contrast-80"
              )}
            />
            <CaretIcon
              className={cn(
                "oui-w-3 oui-h-3",
                open && "oui-text-base-contrast-80 oui-rotate-180"
              )}
            />
          </Flex>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            align="start"
            className="oui-bg-base-8"
          >
            <Flex
              direction="column"
              gap={4}
              px={5}
              py={5}
              width={240}
              justify="start"
              itemAlign="start"
            >
              {DisplayControlMap.map((item) => (
                <Flex
                  key={item.id}
                  justify={"between"}
                  itemAlign={"center"}
                  className="oui-w-full"
                >
                  <Text
                    className={cn(
                      "oui-text-sm oui-text-base-contrast-80",
                      !displayControlState[item.id] &&
                        "oui-text-base-contrast-36"
                    )}
                  >
                    {item.label}
                  </Text>
                  <Switch
                    className="oui-h-4 oui-w-8"
                    checked={displayControlState[item.id]}
                    onCheckedChange={(checked) => {
                      changeDisplayControlState({
                        ...displayControlState,
                        [item.id]: checked,
                      });
                    }}
                  />
                </Flex>
              ))}
            </Flex>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </>
  );
}

export function MobileDisplayControl(props: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className={cn(
          'oui-flex oui-gap-0.5 oui-justify-center oui-text-base-contrast-36 oui-items-center',
          open && "oui-text-base-contrast-8"
          )}>
          <DisplaySettingIcon
            className={cn(
              "oui-w-[18px] oui-h-[18px] ",
              open && "oui-text-base-contrast-80"
            )}
          />
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
          {MobileDisplayControlMap.map((row, id) => (
            <div className="oui-flex oui-gap-2" key={id}>
              {row.map((item) => (
                <div
                  className={cn(
                    "oui-w-full oui-bg-base-5  oui-text-2xs oui-flex oui-items-center oui-justify-between oui-h-6  oui-rounded oui-px-2",
                    props.displayControlState[item.id]
                      ? "oui-text-base-contrast"
                      : "oui-text-base-contrast-36 "
                  )}
                  key={item.id}
                  onClick={() => {
                    props.changeDisplayControlState({
                      ...props.displayControlState,
                      [item.id]: !props.displayControlState[item.id],
                    });
                  }}
                >
                  <div>{item.label}</div>
                  {props.displayControlState[item.id] ? (
                    <SelectedIcon className='oui-h-3 oui-w-3' />
                  ) : (
                    <UnSelectIcon className='oui-h-3 oui-w-3' />
                  )}
                </div>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
}