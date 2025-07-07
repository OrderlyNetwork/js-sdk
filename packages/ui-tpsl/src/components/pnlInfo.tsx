import { useMemo } from "react";
import { cn, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

type Props = {
  tp_pnl?: string | number;
  sl_pnl?: string | number;
  className?: string;
};

export const PnlInfo = (props: Props) => {
  const { tp_pnl, sl_pnl } = props;
  const riskRatio = useMemo(() => {
    if (tp_pnl && sl_pnl) {
      const ratio = new Decimal(tp_pnl).div(sl_pnl).abs().toNumber().toFixed(2);
      return (
        <Flex
          gap={1}
          itemAlign={"center"}
          className="oui-text-base-contrast-80"
        >
          <Text>{ratio}</Text>
          <Text className="oui-text-base-contrast-36">x</Text>
        </Flex>
      );
    }
    return <Text className="oui-text-base-contrast-36">-- x</Text>;
  }, [tp_pnl, sl_pnl]);
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className={cn(
        "oui-w-full oui-gap-[6px] oui-text-2xs oui-text-base-contrast-36",
        props.className,
      )}
    >
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">Total est. TP PnL</Text>
        <Text.numeral
          suffix={
            <Text className="oui-text-base-contrast-36 oui-ml-1">USDC</Text>
          }
          rule="price"
          coloring
          visible={true}
          size="2xs"
          dp={2}
        >
          {tp_pnl ? Number(tp_pnl) : "--"}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">Total est. SL PnL</Text>
        {sl_pnl ? (
          <Text.numeral
            suffix={
              <Text className="oui-text-base-contrast-36 oui-ml-1">USDC</Text>
            }
            coloring
            visible={true}
            size="2xs"
            dp={2}
          >
            {Number(sl_pnl)}
          </Text.numeral>
        ) : (
          <Text size="2xs">-- USDC</Text>
        )}
      </Flex>
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">Risk reward ratio</Text>
        <Text className="oui-text-base-contrast-80" size="2xs">
          {riskRatio}
        </Text>
      </Flex>
    </Flex>
  );
};
