import { FC, useEffect } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { OrderlyOrder, OrderType } from "@veltodefi/types";
import { Checkbox, cn, Divider, Flex, Switch } from "@veltodefi/ui";

export type AdditionalInfoProps = {
  pinned: boolean;
  setPinned: (value: boolean) => void;
  needConfirm: boolean;
  setNeedConfirm: (value: boolean) => void;
  hidden: boolean;
  setHidden: (value: boolean) => void;
  onValueChange?: (key: keyof OrderlyOrder, value: any) => void;
  orderTypeExtra?: OrderType;
  showExtra?: boolean;
};

export const AdditionalInfo: FC<AdditionalInfoProps> = (props) => {
  const { pinned, orderTypeExtra } = props;
  const { t } = useTranslation();

  const onTypeToggle = (type: OrderType) => (checked: boolean) => {
    if (props.onValueChange) {
      props.onValueChange(
        "order_type_ext" as keyof OrderlyOrder,
        checked ? type : "",
        // orderTypeExtra === type ? "" : type
      );
    }
  };

  useEffect(() => {
    props.onValueChange?.("visible_quantity", props.hidden ? 0 : 1);
  }, [props.hidden]);

  return (
    <div className={"oui-text-base-contrast-54"}>
      <Flex
        justify={pinned ? "start" : "between"}
        mb={3}
        width={pinned ? "unset" : "100%"}
        className="oui-gap-x-2 md:oui-gap-x-3"
        wrap="wrap"
        gapY={1}
      >
        <Flex itemAlign={"center"}>
          <Checkbox
            data-testid="oui-testid-orderEntry-postOnly-checkBox"
            id={"toggle_order_post_only"}
            className="oui-peer"
            color={"white"}
            variant={"radio"}
            disabled={!props.showExtra}
            checked={orderTypeExtra === OrderType.POST_ONLY}
            onCheckedChange={onTypeToggle(OrderType.POST_ONLY)}
          />
          <label
            htmlFor={"toggle_order_post_only"}
            className={cn(
              "oui-ml-1 oui-text-2xs peer-data-[disabled]:oui-text-base-contrast-20",
              "oui-whitespace-nowrap oui-break-normal",
            )}
          >
            {t("orderEntry.orderType.postOnly")}
          </label>
        </Flex>
        <Flex itemAlign={"center"}>
          <Checkbox
            data-testid="oui-testid-orderEntry-ioc-checkBox"
            id={"toggle_order_iov"}
            color={"white"}
            className="oui-peer"
            variant={"radio"}
            checked={orderTypeExtra === OrderType.IOC}
            onCheckedChange={onTypeToggle(OrderType.IOC)}
            disabled={!props.showExtra}
          />
          <label
            htmlFor={"toggle_order_iov"}
            className={cn(
              "oui-ml-1 oui-text-2xs peer-data-[disabled]:oui-text-base-contrast-20",
              "oui-whitespace-nowrap oui-break-normal",
            )}
          >
            {t("orderEntry.orderType.ioc")}
          </label>
        </Flex>
        <Flex itemAlign={"center"}>
          <Checkbox
            data-testid="oui-testid-orderEntry-fox-checkBox"
            id={"toggle_order_fok"}
            color={"white"}
            variant={"radio"}
            className="oui-peer"
            checked={orderTypeExtra === OrderType.FOK}
            onCheckedChange={onTypeToggle(OrderType.FOK)}
            disabled={!props.showExtra}
          />
          <label
            htmlFor={"toggle_order_fok"}
            className={cn(
              "oui-ml-1 oui-text-2xs peer-data-[disabled]:oui-text-base-contrast-20",
              "oui-whitespace-nowrap oui-break-normal",
            )}
          >
            {t("orderEntry.orderType.fok")}
          </label>
        </Flex>
      </Flex>

      <Flex gapX={6}>
        <Flex>
          <Checkbox
            data-testid="oui-testid-orderEntry-orderConfirm-checkBox"
            id={"toggle_order_confirm"}
            color={"white"}
            checked={props.needConfirm}
            onCheckedChange={(checked) => {
              props.setNeedConfirm(!!checked);
            }}
          />
          <label
            htmlFor={"toggle_order_confirm"}
            className={"oui-ml-1 oui-text-2xs"}
          >
            {t("orderEntry.orderConfirm")}
          </label>
        </Flex>
        <Flex>
          <Checkbox
            data-testid="oui-testid-orderEntry-hidden-checkBox"
            id={"toggle_order_hidden"}
            color={"white"}
            checked={props.hidden}
            onCheckedChange={(checked: boolean) => {
              props.setHidden(checked);
            }}
          />
          <label
            htmlFor={"toggle_order_hidden"}
            className={"oui-ml-1 oui-text-2xs"}
          >
            {t("orderEntry.hidden")}
          </label>
        </Flex>
      </Flex>
      {!pinned && (
        <>
          <Divider className={"oui-my-3"} />
          <Flex>
            <Switch
              data-testid="oui-testid-orderEntry-additional-keepVisible-switch"
              id={"toggle_order_keep_visible"}
              onCheckedChange={(checked) => {
                props.setPinned(checked);
              }}
            />
            <label
              htmlFor={"toggle_order_keep_visible"}
              className={"oui-ml-1 oui-text-2xs"}
            >
              {t("orderEntry.keepVisible")}
            </label>
          </Flex>
        </>
      )}
    </div>
  );
};
