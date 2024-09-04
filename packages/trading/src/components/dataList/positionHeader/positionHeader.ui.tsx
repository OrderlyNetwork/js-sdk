import { FC } from "react";
import { Flex, Statistic, Text } from "@orderly.network/ui";
import { PositionHeaderState } from "./positionHeader.script";
import { Decimal } from "@orderly.network/utils";

export const PositionHeader: FC<PositionHeaderState> = (props) => {
  return (
    <Flex px={3} py={2} gap={6} width={"100%"} justify={"start"}>
      <Statistic label="Unreal. PnL">
        <Flex>
          <Text.numeral
            coloring
            dp={props.pnlNotionalDecimalPrecision}
            rm={Decimal.ROUND_DOWN}
          >
            {props.unrealPnL}
          </Text.numeral>
          {props.unrealPnlROI && (
            <Text.numeral
              coloring
              prefix="("
              suffix=")"
              rule="percentages"
              dp={props.pnlNotionalDecimalPrecision}
              rm={Decimal.ROUND_DOWN}
            >
              {props.unrealPnlROI}
            </Text.numeral>
          )}
        </Flex>
      </Statistic>
      <Statistic label="Notional">
        <Text.numeral
          dp={props.pnlNotionalDecimalPrecision}
          rm={Decimal.ROUND_DOWN}
        >
          {props.notional}
        </Text.numeral>
      </Statistic>
    </Flex>
  );
};
