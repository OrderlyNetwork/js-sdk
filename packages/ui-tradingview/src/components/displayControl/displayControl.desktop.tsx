import { useMemo, useState } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
  cn,
  Switch,
} from "@kodiak-finance/orderly-ui";
import {
  CaretIcon,
  DisplaySettingIcon,
  SelectedIcon,
  UnSelectIcon,
} from "../../icons";
import { DisplayControl, IProps } from "./common";

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
      {
        label: t("orderEntry.orderType.trailingStop"),
        id: "trailingStop",
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
