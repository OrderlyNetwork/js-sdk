import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide } from "@orderly.network/types";
import {
  ArrowDownShortIcon,
  ArrowUpShortIcon,
  Badge,
  Divider,
  Flex,
  Text,
} from "@orderly.network/ui";
import { OrderInfoCard } from "./OrderInfoCard.ui";
import type { ReversePositionState } from "./reversePosition.script";

export type ReversePositionProps = ReversePositionState & {
  className?: string;
  style?: React.CSSProperties;
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
};

export const ReversePosition: FC<ReversePositionProps> = (props) => {
  const { displayInfo, className, style, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  if (!displayInfo) {
    return null;
  }

  const {
    symbol,
    base,
    quote,
    baseDp,
    quoteDp,
    positionQty,
    reverseQty,
    markPrice,
    leverage,
    isLong,
  } = displayInfo;

  // Determine side badges
  const closeSide = !isLong ? OrderSide.SELL : OrderSide.BUY;
  const openSide = isLong ? OrderSide.SELL : OrderSide.BUY;

  // UI display text translations
  const closeAction = isLong
    ? t("positions.reverse.marketCloseLong")
    : t("positions.reverse.marketCloseShort");
  const openAction =
    openSide === OrderSide.BUY
      ? t("positions.reverse.marketOpenLong")
      : t("positions.reverse.marketOpenShort");
  const reverseTo = isLong
    ? t("positions.reverse.reverseToShort")
    : t("positions.reverse.reverseToLong");

  const reverseToIcon = isLong ? (
    <ArrowDownShortIcon size={16} color="danger" opacity={1} />
  ) : (
    <ArrowUpShortIcon size={16} color="success" opacity={1} />
  );
  const priceLabel = (
    <Flex itemAlign="center" gap={1}>
      <Text.numeral dp={quoteDp} size="sm" intensity={80}>
        {markPrice}
      </Text.numeral>
      <Text size="sm" intensity={36}>
        {quote}
      </Text>
    </Flex>
  );

  return (
    <Flex
      direction="column"
      className={className}
      style={style}
      gap={4}
      width="100%"
    >
      {/* Symbol and Reverse To Badge */}
      <Flex direction="column" gap={2} width="100%">
        <Flex justify="between" itemAlign="center" width="100%">
          <Text.formatted
            size="base"
            weight="semibold"
            rule="symbol"
            formatString="base-type"
            intensity={98}
            showIcon
          >
            {symbol}
          </Text.formatted>

          <Badge color={isLong ? "sell" : "buy"} size="xs">
            {reverseTo}
          </Badge>
        </Flex>

        {/* Mark Price */}
        <Flex justify="between" itemAlign="center" width="100%">
          <Text size="sm" intensity={54}>
            {t("common.markPrice")}
          </Text>
          {priceLabel}
        </Flex>
      </Flex>

      <Divider intensity={4} className="oui-w-full" />

      {/* Close Position Section */}
      <OrderInfoCard
        title={closeAction}
        side={closeSide}
        leverage={leverage}
        qty={positionQty}
        baseDp={baseDp}
      />

      <Flex direction="row" itemAlign="center" width="100%">
        <Divider intensity={8} className="oui-w-full" />
        <Flex className="oui-px-4 oui-py-[3px] oui-border oui-border-base-contrast-12 oui-rounded-full oui-shrink-0">
          {reverseToIcon}
          <Text size="2xs" color={isLong ? "danger" : "success"}>
            {reverseTo}
          </Text>
        </Flex>
        <Divider intensity={8} className="oui-w-full" />
      </Flex>

      {/* Open Position Section */}
      <OrderInfoCard
        title={openAction}
        side={openSide}
        leverage={leverage}
        qty={reverseQty}
        estLiqPrice={priceLabel}
        baseDp={baseDp}
      />

      {/* Reverse To Description */}
      <Text size="2xs" color="warning" weight="semibold">
        {t("positions.reverse.description")}
      </Text>
    </Flex>
  );
};
