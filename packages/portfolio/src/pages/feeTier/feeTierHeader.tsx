/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useFeeState } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import {
  Box,
  Flex,
  modal,
  Text,
  Tooltip,
  useScreen,
} from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { EffectiveFee } from "./icons";

export type FeeTierHeaderItemProps = {
  label: string;
  value: React.ReactNode;
  interactive?: boolean;
};

export type FeeTierHeaderProps = {
  tier?: number | null;
  vol?: number | null;
  headerDataAdapter?: (original: any[]) => any[];
};

const isEffective = (val?: unknown) =>
  typeof val !== "undefined" && val !== null;

export const MobileHeaderItem: React.FC<FeeTierHeaderItemProps> = (props) => {
  const { label, value, interactive } = props;
  const { t } = useTranslation();
  return (
    <Flex justify="between" itemAlign="center" width="100%">
      <Text
        as="div"
        intensity={36}
        size="xs"
        weight="semibold"
        className="oui-leading-[18px]"
      >
        {label}
      </Text>
      <Flex className="oui-gap-1.5" itemAlign="center" justify="between">
        <Text size="xs" intensity={80} className="oui-leading-[24px]">
          {value}
        </Text>
        {interactive && (
          <Flex
            gap={1}
            justify="center"
            itemAlign="center"
            className="oui-cursor-pointer oui-rounded oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)] oui-px-1"
            onClick={() => {
              modal.dialog({
                size: "sm",
                title: t("common.tips"),
                content: t("portfolio.feeTier.effectiveFee.tooltip"),
              });
            }}
          >
            <EffectiveFee />
            <Text.gradient
              className="oui-select-none"
              color={"brand"}
              size="3xs"
              weight="regular"
            >
              {t("common.effectiveFee")}
            </Text.gradient>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export const DesktopHeaderItem: React.FC<FeeTierHeaderItemProps> = (props) => {
  const { label, value, interactive } = props;
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
        {interactive && (
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
  const { isMobile } = useScreen();
  const { refereeRebate, ...others } = useFeeState();
  const isEffectiveFee = isEffective(refereeRebate);
  const items: FeeTierHeaderItemProps[] = [
    {
      label: t("portfolio.feeTier.header.yourTier"),
      interactive: false,
      value: (
        <Text.gradient
          color={"brand"}
          angle={270}
          size={isMobile ? "xs" : "base"}
        >
          {tier || "--"}
        </Text.gradient>
      ),
    },
    {
      label: `${t("portfolio.feeTier.header.30dVolume")} (USDC)`,
      interactive: false,
      value: (
        <Text.numeral
          rule="price"
          dp={2}
          rm={Decimal.ROUND_DOWN}
          size={isMobile ? "xs" : "base"}
        >
          {vol !== undefined && vol !== null ? `${vol}` : "-"}
        </Text.numeral>
      ),
    },
    {
      label: t("portfolio.feeTier.header.takerFeeRate"),
      interactive: isEffectiveFee,
      value: (
        <Text.gradient
          color={"brand"}
          angle={270}
          size={isMobile ? "xs" : "base"}
        >
          {isEffectiveFee
            ? others.effectiveTakerFee || "--"
            : others.takerFee || "--"}
        </Text.gradient>
      ),
    },
    {
      label: t("portfolio.feeTier.header.makerFeeRate"),
      interactive: isEffectiveFee,
      value: (
        <Text.gradient
          color={"brand"}
          angle={270}
          size={isMobile ? "xs" : "base"}
        >
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

  if (isMobile) {
    return (
      <Flex
        className="oui-rounded-xl oui-bg-base-9 oui-p-3"
        direction="column"
        gap={2}
        itemAlign={"stretch"}
      >
        {mergedData.map((item, index) => (
          <MobileHeaderItem {...item} key={`mobile-item-${index}`} />
        ))}
      </Flex>
    );
  }

  return (
    <Flex className="" direction="row" gapX={4} my={4} itemAlign={"stretch"}>
      {mergedData.map((item, index) => (
        <DesktopHeaderItem {...item} key={`desktop-item-${index}`} />
      ))}
    </Flex>
  );
};
