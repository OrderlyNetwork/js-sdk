import React, { useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
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
import type { DisplayControlSettingInterface } from "../../type";

type DisplayControl = {
  label: string;
  id: keyof DisplayControlSettingInterface;
};

interface IProps {
  displayControlState: DisplayControlSettingInterface;
  changeDisplayControlState: (state: DisplayControlSettingInterface) => void;
}

export const DesktopDisplayControl: React.FC<IProps> = (props) => {
  const { displayControlState, changeDisplayControlState } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const displayControlMap = useMemo<DisplayControl[]>(() => {
    return [
      {
        label: t("common.position"),
        id: "position",
      },
      {
        label: t("tradingView.displayControl.buySell"),
        id: "buySell",
      },
      {
        label: t("tradingView.displayControl.limitOrders"),
        id: "limitOrders",
      },
      {
        label: t("tradingView.displayControl.stopOrders"),
        id: "stopOrders",
      },
      {
        label: t("common.tpsl"),
        id: "tpsl",
      },
      {
        label: t("tpsl.positionTpsl"),
        id: "positionTpsl",
      },
    ];
  }, [t]);

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
                open && "oui-text-base-contrast-80",
              )}
            />
            <CaretIcon
              className={cn(
                "oui-w-3 oui-h-3",
                open && "oui-text-base-contrast-80 oui-rotate-180",
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
              {displayControlMap.map((item) => (
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
                        "oui-text-base-contrast-36",
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
};

export const MobileDisplayControl: React.FC<IProps> = (props) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const mobileDisplayControlMap = useMemo<DisplayControl[][]>(() => {
    return [
      [
        {
          label: t("common.position"),
          id: "position",
        },

        {
          label: t("tradingView.displayControl.limitOrders"),
          id: "limitOrders",
        },
      ],
      [
        {
          label: t("tradingView.displayControl.stopOrders"),
          id: "stopOrders",
        },
        {
          label: t("common.tpsl"),
          id: "tpsl",
        },
      ],
      [
        {
          label: t("tpsl.positionTpsl"),
          id: "positionTpsl",
        },
        {
          label: t("tradingView.displayControl.buySell"),
          id: "buySell",
        },
      ],
    ];
  }, [t]);

  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "oui-flex oui-gap-0.5 oui-justify-center oui-text-base-contrast-36 oui-items-center",
            open && "oui-text-base-contrast-8",
          )}
        >
          <DisplaySettingIcon
            className={cn(
              "oui-w-[18px] oui-h-[18px] ",
              open && "oui-text-base-contrast-80",
            )}
          />
          <CaretIcon
            className={cn(
              "oui-w-3 oui-h-3",
              open && "oui-text-base-contrast-80 oui-rotate-180",
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
            "oui-tradingview-display-control-dropdown-menu-content oui-bg-base-9 oui-w-screen oui-flex oui-flex-col oui-gap-2 oui-p-3",
          )}
        >
          {mobileDisplayControlMap.map((row, id) => (
            <div className="oui-flex oui-gap-2" key={id}>
              {row.map((item) => (
                <div
                  className={cn(
                    "oui-w-full oui-bg-base-5  oui-text-2xs oui-flex oui-items-center oui-justify-between oui-h-6  oui-rounded oui-px-2",
                    props.displayControlState[item.id]
                      ? "oui-text-base-contrast"
                      : "oui-text-base-contrast-36 ",
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
                    <SelectedIcon className="oui-size-3" />
                  ) : (
                    <UnSelectIcon className="oui-size-3" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
