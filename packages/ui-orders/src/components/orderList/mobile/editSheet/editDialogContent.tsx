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
import { parseBadgesFor } from "../../../../utils/util";

export const ConfirmDialogContent: FC<EditSheetState> = (props) => {
  const { side } = props.item;
  const { price, quantity, triggerPrice, isAlgoOrder } = props;
  const isBuy = side === OrderSide.BUY;
  return (
    <div className="oui-pt-2">
      <Text
        intensity={80}
      >{`You agree to edit your ${props.base}-PERP order.`}</Text>
      <Flex gap={2} mb={3} mt={2} justify={"between"}>
        <Text.formatted
          rule="symbol"
          formatString="base-type"
          size="base"
          showIcon
        >
          {props.item.symbol}
        </Text.formatted>
        <Flex direction={"row"} gap={1}>
            {parseBadgesFor(props.item)?.map((e, index) => (
              <Badge
                key={index}
                color={
                  e.toLocaleLowerCase() === "position"
                    ? "primaryLight"
                    : "neutral"
                }
                size="xs"
              >
                {e}
              </Badge>
            ))}
            {isBuy && (
              <Badge color="success" size="xs">
                Buy
              </Badge>
            )}
            {!isBuy && (
              <Badge color="danger" size="xs">
                Sell
              </Badge>
            )}
          </Flex>
      </Flex>
      <Divider />
      <Flex
        direction={"column"}
        gap={1}
        width={"100%"}
        className="oui-text-sm oui-text-base-contrast-54"
        py={3}
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
              {triggerPrice ?? "--"}
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
            placeholder={props.isStopMarket ? "Market" : "--"}
          >
            {props.isStopMarket ? "Market" : price ?? "--"}
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
            {quantity ?? "--"}
          </Text.numeral>
        </Flex>
      </Flex>

      <Flex className="oui-gap-[2px]">
        <Checkbox
          color="white"
          id="oui-checkbox-disableOrderConfirmation"
          //   className="oui-h-[10px] oui-w-[10px]"
          //   size={10}
          checked={!props.orderConfirm}
          onCheckedChange={(e: boolean) => {
            props.setOrderConfirm(!e);
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
