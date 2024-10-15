import { FC } from "react";
import { cn, Flex, SimpleDialog, Text } from "@orderly.network/ui";
import { BarcketOrderPriceState } from "./bracketOrderPrice.script";
import { Decimal } from "@orderly.network/utils";

export const BracketOrderPrice: FC<BarcketOrderPriceState> = (props) => {
  if (!props.sl_trigger_price && !props.tp_trigger_price) return <></>;

  return (
    <>
      <button
        onClick={() => {
          props.setOpen(!props.open);
        }}
      >
        <Flex gap={1}>
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

      <SimpleDialog
        title="TP/SL"
        open={props.open}
        onOpenChange={props.setOpen}
        actions={{
          primary: {
            label: "OK",
            onClick: () => props.setOpen(false),
            fullWidth: true,
          },
        }}
      >
        <Flex direction={"column"} itemAlign={"start"} gap={1}>
          {props.roi && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={54}>{"Est. ROI: "}</Text>}
              dp={props.quote_dp}
              rule="percentages"
              coloring
            >
              {props.roi}
            </Text.numeral>
          )}
          {props.pnl && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={54}>{"Est. PnL: "}</Text>}
              dp={props.quote_dp}
              coloring
            >
              {props.pnl}
            </Text.numeral>
          )}
        </Flex>
      </SimpleDialog>
    </>
  );
  // return (
  //   <Tooltip

  //   >

  //   </Tooltip>
  // );
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
        "oui-border-b oui-border-dashed oui-border-base-contrast-36",
        type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
      )}
      key={"tp"}
      rule="price"
      precision={quote_dp}
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
