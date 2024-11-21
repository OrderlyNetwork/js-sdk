import { OrderSide } from "@orderly.network/types";
import { modal, ConfirmProps } from "@orderly.network/ui";
import { Badge, Divider, Flex, Text } from "@orderly.network/ui";
import { useMemo } from "react";

export type MarketDialogProps = {
  quantity: number;
  side: string;
  symbol: string;
  price: number;
  total: number;
  // quote: string;
};

export const LimitDialog = (props: MarketDialogProps) => {
  const quote = useMemo(() => {
    return props.symbol.split("_")[2];
  }, [props.symbol]);
  return (
    <div className="oui-text-sm oui-text-base-contrast-54">
      <Text size="sm" intensity={54}>
        You agree closing 0.11 SOL position at limit price.
      </Text>
      <Flex justify={"between"} pt={5}>
        <Text.formatted
          rule={"symbol"}
          showIcon
          className="oui-text-base-contrast"
        >
          {props.symbol}
        </Text.formatted>
        <Flex gapX={1}>
          <Badge color={"neutral"} size="sm">
            Limit
          </Badge>
          <Badge
            color={props.side === OrderSide.SELL ? "danger" : "success"}
            size="sm"
          >
            Sell
          </Badge>
        </Flex>
      </Flex>
      <Divider className="oui-mt-[18px] oui-mb-[18px]" />
      <Flex justify={"between"} mb={1}>
        <Text>Qty.</Text>
        <Text.numeral color={props.side === OrderSide.SELL ? "sell" : "buy"}>
          {props.quantity}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} mb={1}>
        <Text>Price</Text>
        <Text.numeral unit={quote} unitClassName="oui-pl-1">
          {props.price}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"}>
        <Text>Total</Text>
        <Text.numeral unit={quote} unitClassName="oui-pl-1">
          {props.total}
        </Text.numeral>
      </Flex>
    </div>
  );
};

export const limitCloseConfirm = (
  args: MarketDialogProps,
  options: ConfirmProps
) => {
  return modal.confirm({
    ...options,
    size: "sm",

    title: "Limit Close",
    content: <LimitDialog {...args} />,
  });
};
