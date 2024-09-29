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
      py={2}
    >
      <Flex width={"100%"} justify={"between"}>
        <UlrealPnL
          classNames={{
            label: "oui-text-2xs",
            root: "oui-text-sm",
          }}
          {...props}
        />
        <Notional
          classNames={{
            label: "oui-text-2xs",
            root: "oui-text-sm",
          }}
          {...props}
        />
      </Flex>
      <Divider className="oui-w-full" />
      <Flex className="oui-gap-[2px] oui-cursor-pointer">
        <Checkbox
          color="white"
          checked={props.showAllSymbol}
          onCheckedChange={(checked: boolean) => {
            props.setShowAllSymbol(checked);
          }}
        />
        <Text size="2xs" intensity={54} onClick={() => {
          props.setShowAllSymbol(!props.showAllSymbol);
        }}>
          Show all instruments
        </Text>
      </Flex>
    </Flex>
  );
};
const DesktopLayout: FC<PositionHeaderState> = (props) => {
  return (
    <Flex px={3} py={2} gap={6} width={"100%"} justify={"start"}>
      <UlrealPnL {...props} />
      <Notional {...props} />
    </Flex>
  );
};

const UlrealPnL: FC<
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
    <Statistic label="Unreal. PnL" classNames={props.classNames}>
      <Flex>
        <Text.numeral
          coloring
          dp={props.pnlNotionalDecimalPrecision}
          rm={Decimal.ROUND_DOWN}
        >
          {props.unrealPnL}
        </Text.numeral>
        {props.unrealPnlROI && (
          <Text.numeral
            coloring
            prefix="("
            suffix=")"
            rule="percentages"
            dp={props.pnlNotionalDecimalPrecision}
            rm={Decimal.ROUND_DOWN}
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
      >
        {props.notional}
      </Text.numeral>
    </Statistic>
  );
};
