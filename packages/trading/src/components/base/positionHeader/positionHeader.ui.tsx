import { FC } from "react";
import { Checkbox, Divider, Flex, Statistic, Text } from "@orderly.network/ui";
import { PositionHeaderState } from "./positionHeader.script";
import { Decimal } from "@orderly.network/utils";
import { useMediaQuery } from "@orderly.network/hooks";

export const PositionHeader: FC<PositionHeaderState> = (props) => {
  const isMobileLayout = useMediaQuery(props.tabletMediaQuery);

  return isMobileLayout ? (
    <MobileLayout {...props} />
  ) : (
    <DesktopLayout {...props} />
  );
};

const MobileLayout: FC<PositionHeaderState> = (props) => {
  return (
    <Flex
      direction={"column"}
      gap={2}
      width={"100%"}
      itemAlign={"start"}
      p={2}
      className="oui-bg-base-9 oui-rounded-b-xl"
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
      <Flex className="oui-gap-[2px] oui-cursor-pointer">
        <Checkbox
          id="oui-checkbox-showAllInstruments"
          color="white"
          checked={props.showAllSymbol}
          onCheckedChange={(checked: boolean) => {
            props.setShowAllSymbol(checked);
          }}
        />

        <label
          className="oui-text-2xs oui-text-base-contrast-54 oui-cursor-pointer"
          htmlFor="oui-checkbox-showAllInstruments"
        >
          Show all trading pairs
        </label>
      </Flex>
    </Flex>
  );
};
const DesktopLayout: FC<PositionHeaderState> = (props) => {
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

const UnrealPnL: FC<
  PositionHeaderState & {
    classNames?:
      | {
          root?: string;
          label?: string;
          value?: string;
        }
      | undefined;
  }
> = (props) => {
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
    <Statistic label="Unreal. PnL" classNames={props.classNames}>
      <Flex gap={1}>
        <Text.numeral
          dp={props.pnlNotionalDecimalPrecision}
          rm={Decimal.ROUND_DOWN}
          intensity={80}
          className={unrealPnLClsName}
        >
          {props.unrealPnL ?? "--"}
        </Text.numeral>
        {typeof props.unrealPnlROI !== "undefined" && (
          <Text.numeral
            prefix="("
            suffix=")"
            rule="percentages"
            size="2xs"
            dp={props.pnlNotionalDecimalPrecision}
            rm={Decimal.ROUND_DOWN}
            className={unrealPnLROIClsName}
          >
            {props.unrealPnlROI}
          </Text.numeral>
        )}
      </Flex>
    </Statistic>
  );
};

const Notional: FC<
  PositionHeaderState & {
    classNames?:
      | {
          root?: string;
          label?: string;
          value?: string;
        }
      | undefined;
  }
> = (props) => {
  return (
    <Statistic label="Notional" classNames={props.classNames}>
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
