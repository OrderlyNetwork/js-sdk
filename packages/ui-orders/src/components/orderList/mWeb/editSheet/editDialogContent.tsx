import {
  Badge,
  Button,
  Checkbox,
  cn,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Slider,
  Text,
} from "@orderly.network/ui";
import { EditSheetState } from "./editSheet.script";
import { FC } from "react";
import { commify, Decimal } from "@orderly.network/utils";
import { OrderSide } from "@orderly.network/types";

export const ConfirmDialogContent: FC<EditSheetState> = (props) => {
  const { side } = props.item;
  const { price, quantity, triggerPrice, isAlgoOrder } = props;
  return (
    <div>
      <Flex gap={2} mb={4} mt={5} justify={"between"}>
        <Text.formatted
          rule="symbol"
          formatString="base-type"
          size="base"
          showIcon
        >
          {props.item.symbol}
        </Text.formatted>
        <Flex gap={1}>
          <Badge color="neutral" size="xs">
            Limit
          </Badge>
          <Badge
            color={props.item.side === OrderSide.BUY ? "success" : "danger"}
            size="xs"
          >
            {props.item.side === OrderSide.BUY ? "Buy" : "Sell"}
          </Badge>
        </Flex>
      </Flex>
      <Divider />
      <Flex
        direction={"column"}
        gap={1}
        width={"100%"}
        className="oui-text-sm oui-text-base-contrast-54"
        py={5}
      >
        {isAlgoOrder && (
          <Flex justify={"between"} width={"100%"} gap={1}>
            <Text>Trigger price</Text>
            <Text.numeral
              intensity={80}
              dp={props.quote_dp}
              padding={false}
              rm={Decimal.ROUND_DOWN}
              suffix={<Text intensity={54}>{" USDC"}</Text>}
            >
              {triggerPrice}
            </Text.numeral>
          </Flex>
        )}

        <Flex justify={"between"} width={"100%"} gap={1}>
          <Text>Price</Text>
          <Text.numeral
            intensity={80}
            dp={props.quote_dp}
            padding={false}
            rm={Decimal.ROUND_DOWN}
            suffix={<Text intensity={54}>{" USDC"}</Text>}
          >
            {price}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"} width={"100%"} gap={1}>
          <Text>Qty.</Text>
          <Text.numeral
            color={side === OrderSide.BUY ? "buy" : "sell"}
            dp={props.base_dp}
            padding={false}
            rm={Decimal.ROUND_DOWN}
          >
            {quantity}
          </Text.numeral>
        </Flex>
      </Flex>

      <Flex className="oui-gap-[2px]">
        <Checkbox
          color="white"
          id="oui-checkbox-disableOrderConfirmation"
          //   className="oui-h-[10px] oui-w-[10px]"
          //   size={10}
          checked={props.orderConfirm}
          onCheckedChange={(e: boolean) => {
            props.setOrderConfirm(e);
          }}
        />
        <label
          className="oui-text-2xs oui-text-base-contrast-54"
          htmlFor="oui-checkbox-disableOrderConfirmation"
        >
          Disable order confirmation
        </label>
      </Flex>
    </div>
  );
};
