import { FC } from "react";
import { cn, Flex, SimpleDialog, Text } from "@orderly.network/ui";
import { BracketOrderPriceState } from "./bracketOrderPrice.script";
import { Decimal } from "@orderly.network/utils";
import { MobileTooltip } from "../items";

export const BracketOrderPrice: FC<BracketOrderPriceState> = (props) => {
  if (!props.sl_trigger_price && !props.tp_trigger_price) return <></>;

  return (
    <>
      <MobileTooltip
        classNames={{
          content: "oui-bg-base-6 oui-ml-2",
          arrow: "oui-fill-base-6",
        }}
        content={
          <Flex direction={"column"} itemAlign={"start"} gap={1}>
            {typeof props.pnl?.tpPnL !== "undefined" && (
              <Text.numeral
                // @ts-ignore
                prefix={<Text intensity={80}>TP PnL: &nbsp;</Text>}
                suffix={<Text intensity={20}>{" USDC"}</Text>}
                dp={props.quote_dp}
                color="buy"
                showIdentifier
              >
                {props.pnl?.tpPnL}
              </Text.numeral>
            )}
            {typeof props.pnl?.slPnL !== "undefined" && (
              <Text.numeral
                // @ts-ignore
                prefix={<Text intensity={80}>SL PnL: &nbsp;</Text>}
                suffix={<Text intensity={20}>{" USDC"}</Text>}
                dp={props.quote_dp}
                color="sell"
              >
                {props.pnl?.slPnL}
              </Text.numeral>
            )}
          </Flex>
        }
      >
        <button
          onClick={() => {
            props.setOpen(!props.open);
          }}
        >
          <Flex gap={1} width={"1"}>
            {props.tp_trigger_price && (
              <Price
                type="TP"
                value={props.tp_trigger_price}
                quote_dp={props.quote_dp}
              />
            )}
            {props.sl_trigger_price && (
              <Price
                type="SL"
                value={props.sl_trigger_price}
                quote_dp={props.quote_dp}
              />
            )}
          </Flex>
        </button>
      </MobileTooltip>
    </>
  );
};

const Price = (props: {
  type: "TP" | "SL";
  value?: number | string;
  quote_dp: number;
}) => {
  const { type, value, quote_dp } = props;
  
  return value ? (
    <Text.numeral
      size="2xs"
      className={cn(
        "oui-border-b oui-border-dashed oui-border-base-contrast-12",
        type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
      )}
      key={"tp"}
      rule="price"
      dp={quote_dp}
      padding={false}
      rm={Decimal.ROUND_DOWN}
      // @ts-ignore
      prefix={
        <span className={"oui-text-base-contrast-36"}>
          {`${type} `}:&nbsp;&nbsp;
        </span>
      }
    >
      {value}
    </Text.numeral>
  ) : (
    <></>
  );
};
