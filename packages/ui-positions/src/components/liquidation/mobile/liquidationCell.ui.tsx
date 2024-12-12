import { FC } from "react";
import { cn, Divider, Flex, Grid, Text } from "@orderly.network/ui";
import { LiquidationCellState } from "./liquidationCell.script";
import { LiquidationFee, Price, Quantity } from "./items";
import { API } from "@orderly.network/types";
import { SymbolProvider } from "../../../providers/symbolProvider";

export const LiquidationCell: FC<
  LiquidationCellState & {
    classNames?: {
      root?: string;
    };
  }
> = (props) => {
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      itemAlign={"start"}
      className={props.classNames?.root}
    >
      <Header {...props} />
      <Body {...props} />
    </Flex>
  );
};

export const Header: FC<LiquidationCellState> = (props) => {
  return (
    <Flex gap={1} width={"100%"}>
      <Flex
        direction={"column"}
        itemAlign={"start"}
        className="oui-flex-1"
        gap={1}
      >
        <Text.formatted
          size="2xs"
          intensity={36}
          rule={"date"}
          formatString="yyyy-MM-dd hh:mm:ss"
        >
          {props.item.timestamp}
        </Text.formatted>
        <Flex>
          <Text size="2xs" intensity={36}>
            liquidation_id:
          </Text>
          <Text
            size="2xs"
            intensity={80}
          >{` ${props.item.liquidation_id}`}</Text>
        </Flex>
      </Flex>
      <Flex direction={"column"} itemAlign={"end"} className="oui-flex-1">
        <Text size="2xs" intensity={36}>
          Ins. Fund Transfer:
        </Text>
        <Text.numeral intensity={80} size="xs">
          {props.item.transfer_amount_to_insurance_fund}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};

export const Body: FC<LiquidationCellState> = (props) => {
  return (
    <Flex direction={"column"} width={"100%"}>
      {props.item.positions_by_perp?.map((item, index) => {
        return (
          <SymbolProvider symbol={item.symbol}>
            <Cell isLast={index === props.item.positions_by_perp.length-1} {...item} />
          </SymbolProvider>
        );
      })}
    </Flex>
  );
};

const Cell: FC<API.LiquidationPositionByPerp & {
    isLast: boolean;
}> = (props) => {
  return (
    <Flex
      width={"100%"}
      itemAlign={"start"}
      className={cn("oui-border-t-[1px] oui-border-line-6 oui-pt-2", !props.isLast && "oui-pb-2")}
    >
      <Text size="xs" intensity={80} className="oui-flex-1">
        {props.symbol}
      </Text>
      <Grid cols={1} rows={3} width={"100%"} gap={1} className="oui-flex-1">
        <Price {...props} />
        <Quantity {...props} />
        <LiquidationFee {...props} />
      </Grid>
    </Flex>
  );
};
