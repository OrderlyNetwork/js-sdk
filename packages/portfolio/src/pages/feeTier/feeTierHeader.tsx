import { useMemo } from "react";
import { useFeeState } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, Tooltip } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { EffectiveFee } from "./icons";

export type FeeTierHeaderItemProps = {
  label: string;
  value: React.ReactNode;
  needShowTooltip?: boolean;
};

export type FeeTierHeaderProps = {
  tier?: number;
  vol?: number;
  headerDataAdapter?: (original: any[]) => any[];
};

const isEffective = (val?: unknown) =>
  typeof val !== "undefined" && val !== null;

export const FeeTierHeaderItem: React.FC<FeeTierHeaderItemProps> = (props) => {
  const { label, value, needShowTooltip } = props;
  const { t } = useTranslation();
  return (
    <Box
      gradient="neutral"
      r="lg"
      px={4}
      py={2}
      angle={184}
      width="100%"
      border
      borderColor={6}
    >
      <Text
        as="div"
        intensity={36}
        size="2xs"
        weight="semibold"
        className="oui-leading-[18px]"
      >
        {label}
      </Text>
      <Flex
        className="oui-mt-1 oui-w-full"
        itemAlign="center"
        justify="between"
      >
        <Text size="base" intensity={80} className="oui-leading-[24px]">
          {value}
        </Text>
        {needShowTooltip && (
          <Tooltip
            content={t("portfolio.feeTier.effectiveFee.tooltip")}
            className="oui-p-1.5 oui-text-base-contrast-54"
          >
            <Flex
              gap={1}
              justify="center"
              itemAlign="center"
              className="oui-cursor-pointer oui-rounded oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)] oui-px-1"
            >
              <EffectiveFee />
              <Text.gradient
                className="oui-select-none"
                color={"brand"}
                size="xs"
                weight="regular"
              >
                {t("common.effectiveFee")}
              </Text.gradient>
            </Flex>
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
};

export const FeeTierHeader: React.FC<FeeTierHeaderProps> = (props) => {
  const { t } = useTranslation();
  const { tier, vol, headerDataAdapter } = props;
  const { refereeRebate, ...others } = useFeeState();
  const isEffectiveFee = isEffective(refereeRebate);
  const items: FeeTierHeaderItemProps[] = [
    {
      label: t("portfolio.feeTier.header.yourTier"),
      needShowTooltip: false,
      value: (
        <Text.gradient color={"brand"} angle={270} size="base">
          {tier || "--"}
        </Text.gradient>
      ),
    },
    {
      label: `${t("portfolio.feeTier.header.30dVolume")} (USDC)`,
      needShowTooltip: false,
      value: (
        <Text.numeral rule="price" dp={2} rm={Decimal.ROUND_DOWN}>
          {vol !== undefined && vol !== null ? `${vol}` : "-"}
        </Text.numeral>
      ),
    },
    {
      label: t("portfolio.feeTier.header.takerFeeRate"),
      needShowTooltip: isEffectiveFee,
      value: (
        <Text.gradient color={"brand"} angle={270} size="base">
          {isEffectiveFee
            ? others.effectiveTakerFee || "--"
            : others.takerFee || "--"}
        </Text.gradient>
      ),
    },
    {
      label: t("portfolio.feeTier.header.makerFeeRate"),
      needShowTooltip: isEffectiveFee,
      value: (
        <Text.gradient color={"brand"} angle={270} size="base">
          {isEffectiveFee
            ? others.effectiveMakerFee || "--"
            : others.makerFee || "--"}
        </Text.gradient>
      ),
    },
  ];
  const mergedData = useMemo<FeeTierHeaderItemProps[]>(() => {
    if (typeof headerDataAdapter === "function") {
      return headerDataAdapter(items);
    }
    return items;
  }, [headerDataAdapter, items]);

  if (!Array.isArray(mergedData)) {
    return null;
  }

  return (
    <Flex direction="row" gapX={4} my={4} itemAlign={"stretch"}>
      {mergedData.map((item, index) => (
        <FeeTierHeaderItem {...item} key={`item-${index}`} />
      ))}
    </Flex>
  );
};
