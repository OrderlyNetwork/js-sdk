import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Text } from "@orderly.network/ui";
import { Decimal, checkIsNaN } from "@orderly.network/utils";

type PnlValues = {
  tp_pnl?: string | number;
  sl_pnl?: string | number;
};

type Props = PnlValues & {
  riskRewardPnl?: PnlValues;
  className?: string;
};

export const PnlInfo = (props: Props) => {
  const { t } = useTranslation();
  const { tp_pnl, sl_pnl } = props;
  const { tp_pnl: riskRewardTpPnl, sl_pnl: riskRewardSlPnl } =
    props.riskRewardPnl ?? props;
  const riskRatio = useMemo(() => {
    const defaultNode = <Text className="oui-text-base-contrast-36">-- x</Text>;
    if (
      riskRewardTpPnl === undefined ||
      riskRewardSlPnl === undefined ||
      checkIsNaN(riskRewardTpPnl) ||
      checkIsNaN(riskRewardSlPnl)
    ) {
      return defaultNode;
    }
    const tpDecimal = new Decimal(riskRewardTpPnl);
    const slDecimal = new Decimal(riskRewardSlPnl);
    if (slDecimal.isZero() || tpDecimal.isZero()) {
      return defaultNode;
    }
    const ratio = tpDecimal.div(slDecimal).abs().toNumber().toFixed(2);
    return (
      <Flex gap={1} itemAlign={"center"} className="oui-text-base-contrast-80">
        <Text>{ratio}</Text>
        <Text className="oui-text-base-contrast-36">x</Text>
      </Flex>
    );
  }, [riskRewardTpPnl, riskRewardSlPnl]);
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className={cn(
        "oui-w-full oui-gap-1 oui-text-2xs oui-text-base-contrast-36",
        props.className,
      )}
    >
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">{t("tpsl.totalEstTpPnl")}</Text>
        <Text.numeral
          suffix={
            <Text className="oui-text-base-contrast-36 oui-ms-1">USDC</Text>
          }
          rule="price"
          coloring
          visible={true}
          size="2xs"
          dp={2}
        >
          {checkIsNaN(tp_pnl) ? "--" : Number(tp_pnl)}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">{t("tpsl.totalEstSlPnl")}</Text>
        {!checkIsNaN(sl_pnl) ? (
          <Text.numeral
            suffix={
              <Text className="oui-text-base-contrast-36 oui-ms-1">USDC</Text>
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
        <Text size="2xs">{t("tpsl.riskRewardRatio")}</Text>
        <Text className="oui-text-base-contrast-80" size="2xs">
          {riskRatio}
        </Text>
      </Flex>
    </Flex>
  );
};
