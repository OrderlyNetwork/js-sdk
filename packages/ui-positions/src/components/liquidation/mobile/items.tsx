import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import React from "react";
import { API } from "@orderly.network/types";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { commifyOptional } from "@orderly.network/utils";

export const Price: FC<API.LiquidationPositionByPerp> = (props) => {
  // const { quote_dp } = useSymbolContext();
  return (
    <Flex width={"100%"} justify={"between"}>
      <Text size="2xs" intensity={36}>
        Price{<Text intensity={20}>{" (USDC)"}</Text>}
      </Text>
      {/* <Text.numeral size="2xs" intensity={80} dp={quote_dp} padding={false}>
        {props.transfer_price}
      </Text.numeral> */}
      <Text size="2xs" intensity={80}>
        {commifyOptional(props.transfer_price)}
      </Text>
    </Flex>
  );
};
export const Quantity: FC<API.LiquidationPositionByPerp> = (props) => {
  // const { quote_dp } = useSymbolContext();
  return (
    <Flex width={"100%"} justify={"between"}>
      <Text size="2xs" intensity={36}>
        Quantity
      </Text>
      {/* <Text.numeral size="2xs" intensity={80} dp={quote_dp} padding={false}>
        {props.position_qty}
      </Text.numeral> */}
      <Text size="2xs" intensity={80}>
        {commifyOptional(props.position_qty)}
      </Text>
    </Flex>
  );
};
export const LiquidationFee: FC<API.LiquidationPositionByPerp> = (props) => {
  // const { quote_dp } = useSymbolContext();
  return (
    <Flex width={"100%"} justify={"between"}>
      <Text size="2xs" intensity={36}>
        Liquidation fee
      </Text>
      {/* <Text.numeral size="2xs" intensity={80} dp={quote_dp} padding={false}>
        {props.abs_liquidation_fee}
      </Text.numeral>  */}
      <Text size="2xs" intensity={80}>
        {commifyOptional(props.abs_liquidation_fee)}
      </Text>
    </Flex>
  );
};
