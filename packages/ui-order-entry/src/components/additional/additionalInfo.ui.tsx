import { Checkbox, Divider, Flex, Grid, Switch } from "@orderly.network/ui";
import { OrderlyOrder, OrderType } from "@orderly.network/types";

export type AdditionalInfoProps = {
  pinned: boolean;
  setPinned: (value: boolean) => void;
  needConfirm: boolean;
  setNeedConfirm: (value: boolean) => void;
  orderTypeExtra?: OrderType;
  onValueChange?: (key: keyof OrderlyOrder, value: any) => void;
};

export const AdditionalInfo = (props: AdditionalInfoProps) => {
  const { pinned, orderTypeExtra } = props;
  const onTypeToggle = (type: OrderType) => (checked: boolean) => {
    if (props.onValueChange) {
      props.onValueChange(
        "order_type_ext" as keyof OrderlyOrder,
        checked ? type : ""
        // orderTypeExtra === type ? "" : type
      );
    }
  };
  return (
    <div className={"oui-text-base-contrast-54"}>
      <Flex
        justify={pinned ? "between" : "stretch"}
        itemAlign={"center"}
        mb={3}
      >
        <Flex
          gapX={5}
          justify={pinned ? "start" : "between"}
          width={pinned ? "unset" : "100%"}
        >
          <Flex itemAlign={"center"}>
            <Checkbox
              id={"toggle_order_post_only"}
              color={"white"}
              variant={"radio"}
              checked={orderTypeExtra === OrderType.POST_ONLY}
              onCheckedChange={onTypeToggle(OrderType.POST_ONLY)}
            />
            <label
              htmlFor={"toggle_order_post_only"}
              className={"oui-text-2xs oui-ml-1"}
            >
              Post only
            </label>
          </Flex>
          <Flex itemAlign={"center"}>
            <Checkbox
              id={"toggle_order_iov"}
              color={"white"}
              variant={"radio"}
              checked={orderTypeExtra === OrderType.IOC}
              onCheckedChange={onTypeToggle(OrderType.IOC)}
            />
            <label
              htmlFor={"toggle_order_iov"}
              className={"oui-text-2xs oui-ml-1"}
            >
              IOC
            </label>
          </Flex>
          <Flex itemAlign={"center"}>
            <Checkbox
              id={"toggle_order_fok"}
              color={"white"}
              variant={"radio"}
              checked={orderTypeExtra === OrderType.FOK}
              onCheckedChange={onTypeToggle(OrderType.FOK)}
            />
            <label
              htmlFor={"toggle_order_fok"}
              className={"oui-text-2xs oui-ml-1"}
            >
              FOK
            </label>
          </Flex>
        </Flex>
        {pinned && (
          <button
            onClick={() => {
              props.setPinned(false);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.67 1.953A2.667 2.667 0 0 0 2.005 4.62v6.667a2.667 2.667 0 0 0 2.667 2.666h6.666a2.667 2.667 0 0 0 2.667-2.666V4.62a2.667 2.667 0 0 0-2.667-2.667zm1.334 3.334c.17 0 .349.057.48.187l1.52 1.52 1.52-1.52a.68.68 0 0 1 .48-.187c.17 0 .349.057.48.187.26.26.26.698 0 .958L8.962 7.954l1.52 1.52c.26.262.26.699 0 .96a.687.687 0 0 1-.958 0l-1.52-1.522-1.52 1.52a.687.687 0 0 1-.96 0 .687.687 0 0 1 0-.958l1.521-1.52-1.52-1.521a.687.687 0 0 1 0-.96.68.68 0 0 1 .479-.186"
                fill="#fff"
                fillOpacity=".2"
              />
            </svg>
          </button>
        )}
      </Flex>
      <Flex gapX={6}>
        <Flex>
          <Checkbox
            id={"toggle_order_confirm"}
            color={"white"}
            checked={props.needConfirm}
            onCheckedChange={(checked) => {
              props.setNeedConfirm(!!checked);
            }}
          />
          <label
            htmlFor={"toggle_order_confirm"}
            className={"oui-text-2xs oui-ml-1"}
          >
            Order confirm
          </label>
        </Flex>
        <Flex>
          <Checkbox
            id={"toggle_order_hidden"}
            color={"white"}
            onCheckedChange={(checked) => {
              props.onValueChange?.("visible_quantity", checked ? 0 : 1);
            }}
          />
          <label
            htmlFor={"toggle_order_hidden"}
            className={"oui-text-2xs oui-ml-1"}
          >
            Hidden
          </label>
        </Flex>
      </Flex>
      {!pinned && (
        <>
          <Divider className={"oui-my-3"} />
          <Flex>
            <Switch
              id={"toggle_order_keep_visible"}
              onCheckedChange={(checked) => {
                props.setPinned(checked);
              }}
            />
            <label
              htmlFor={"toggle_order_keep_visible"}
              className={"oui-text-2xs oui-ml-1"}
            >
              Keep visible
            </label>
          </Flex>
        </>
      )}
    </div>
  );
};
