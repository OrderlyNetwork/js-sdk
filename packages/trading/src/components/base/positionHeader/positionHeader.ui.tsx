import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Checkbox,
  Divider,
  Flex,
  Statistic,
  Text,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type { PositionHeaderState } from "./positionHeader.script";

export const PositionHeader: React.FC<PositionHeaderState> = (props) => {
  const { isMobile } = useScreen();
  return isMobile ? <MobileLayout {...props} /> : <DesktopLayout {...props} />;
};

const MobileLayout: React.FC<PositionHeaderState> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction={"column"}
      gap={2}
      width={"100%"}
      itemAlign={"start"}
      p={2}
      className="oui-rounded-b-xl oui-bg-base-9"
    >
      <Flex width={"100%"} justify={"between"}>
        <UnrealPnL
          classNames={{
            label: "oui-text-2xs oui-text-base-contrast-54",
            root: "oui-text-sm",
          }}
          {...props}
        />
        <Notional
          classNames={{
            label: "oui-text-2xs oui-text-base-contrast-54",
            root: "oui-text-sm",
          }}
          {...props}
        />
      </Flex>
      <Divider className="oui-w-full" />
      <Flex className="oui-cursor-pointer oui-gap-[2px]">
        <Checkbox
          id="oui-checkbox-hideOtherSymbols"
          color="white"
          checked={!props.showAllSymbol}
          onCheckedChange={(checked: boolean) => {
            props.setShowAllSymbol(!checked);
          }}
        />

        <label
          className="oui-cursor-pointer oui-text-2xs oui-text-base-contrast-54"
          htmlFor="oui-checkbox-hideOtherSymbols"
        >
          {t("trading.hideOtherSymbols")}
        </label>
      </Flex>
    </Flex>
  );
};

const DesktopLayout: React.FC<PositionHeaderState> = (props) => {
  return (
    <Flex py={2} px={3} gap={6} width={"100%"} justify={"start"}>
      <UnrealPnL
        {...props}
        classNames={{ label: "oui-text-base-contrast-54" }}
      />
      <Notional
        {...props}
        classNames={{ label: "oui-text-base-contrast-54" }}
      />
    </Flex>
  );
};

const UnrealPnL: React.FC<
  PositionHeaderState & {
    classNames?: { root?: string; label?: string; value?: string };
  }
> = (props) => {
  const { t } = useTranslation();

  const unrealPnLClsName =
    typeof props.unrealPnL === "number"
      ? props.unrealPnL >= 0
        ? "oui-text-trade-profit"
        : "oui-text-trade-loss"
      : "oui-text-base-contrast-80";

  const unrealPnLROIClsName =
    typeof props.unrealPnL === "number" && props.unrealPnlROI
      ? props.unrealPnlROI >= 0
        ? "oui-text-success-darken"
        : "oui-text-danger-darken"
      : "oui-text-base-contrast-80";

  return (
    <Statistic label={t("common.unrealizedPnl")} classNames={props.classNames}>
      <Flex gap={1}>
        <Text.pnl
          dp={props.pnlNotionalDecimalPrecision}
          intensity={80}
          className={unrealPnLClsName}
        >
          {props.unrealPnL ?? "--"}
        </Text.pnl>
        {typeof props.unrealPnlROI !== "undefined" && (
          <Text.roi
            prefix="("
            suffix=")"
            rule="percentages"
            size="2xs"
            dp={props.pnlNotionalDecimalPrecision}
            className={unrealPnLROIClsName}
          >
            {props.unrealPnlROI}
          </Text.roi>
        )}
      </Flex>
    </Statistic>
  );
};

const Notional: React.FC<
  PositionHeaderState & {
    classNames?: { root?: string; label?: string; value?: string };
  }
> = (props) => {
  const { t } = useTranslation();
  return (
    <Statistic label={t("common.notional")} classNames={props.classNames}>
      <Text.numeral
        dp={props.pnlNotionalDecimalPrecision}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
      >
        {props.notional ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};
