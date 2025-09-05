import { useMemo, useState } from "react";
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
import { DisplayControl, IProps } from "./common";

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
            "oui-flex oui-items-center oui-justify-center oui-gap-0.5 oui-text-base-contrast-36",
            open && "oui-text-base-contrast-8",
          )}
        >
          <DisplaySettingIcon
            className={cn(
              "oui-size-[18px] ",
              open && "oui-text-base-contrast-80",
            )}
          />
          <CaretIcon
            className={cn(
              "oui-size-3",
              open && "oui-rotate-180 oui-text-base-contrast-80",
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
            "oui-tradingview-display-control-dropdown-menu-content oui-flex oui-w-screen oui-flex-col oui-gap-2 oui-bg-base-9 oui-p-3",
          )}
        >
          {mobileDisplayControlMap.map((row, id) => (
            <div className="oui-flex oui-gap-2" key={id}>
              {row.map((item) => (
                <div
                  className={cn(
                    "oui-flex oui-h-6  oui-w-full oui-items-center oui-justify-between oui-rounded oui-bg-base-5  oui-px-2 oui-text-2xs",
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
