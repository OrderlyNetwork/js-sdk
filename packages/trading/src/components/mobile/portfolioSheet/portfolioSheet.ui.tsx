import { FC, useCallback } from "react";
import {
  ArrowUpShortIcon,
  Button,
  Divider,
  EyeCloseIcon,
  EyeIcon,
  Flex,
  Grid,
  modal,
  RefreshIcon,
  Slider,
  Statistic,
  Text,
} from "@orderly.network/ui";
import { PortfolioSheetState } from "./portfolioSheet.script";
import { USDCIcon } from "../accountSheet/icons";

export const PortfolioSheet: FC<PortfolioSheetState> = (props) => {
  return (
    <Flex direction={"column"} gap={4} width={"100%"} pt={3}>
      <Divider className="oui-w-full" />
      <Asset {...props} />
      <Divider className="oui-w-full" />
      <MarginRatio {...props} />
      <Leverage {...props} />
      <Divider className="oui-w-full" />
      <AvaiableBalance {...props} />
      <Buttons {...props} />
    </Flex>
  );
};

const Asset: FC<PortfolioSheetState> = (props) => {
  const onUnsettleClick = useCallback(() => {
    return modal.confirm({
      title: "Settle PnL",
      // maxWidth: "xs",
      content: (
        <Text intensity={54} size="xs">
          Are you sure you want to settle your PnL? Settlement will take up to 1
          minute before you can withdraw your available balance.
        </Text>
      ),
      onCancel: () => {
        return Promise.reject();
      },
      onOk: () => {
        if (typeof props.onSettlePnL !== "function") return Promise.resolve();
        return props.onSettlePnL().catch((e) => {});
      },
    });
  }, []);

  const clsName =
    props.totalUnrealizedROI > 0
      ? "oui-text-success-darken"
      : "oui-text-danger-darken";

  return (
    <Flex direction={"column"} gap={3} width={"100%"}>
      <Flex direction={"column"} itemAlign={"start"} width={"100%"}>
        <Text.formatted
          size="2xs"
          intensity={36}
          suffix={
            props.hideAssets ? (
              <EyeIcon color="primary" opacity={1} size={16} />
            ) : (
              <EyeCloseIcon color="primary" opacity={1} size={16} />
            )
          }
          onClick={(e) => {
            props.toggleHideAssets();
          }}
        >
          Total value (USDC)
        </Text.formatted>
        <Text.numeral
          size="base"
          coloring
          dp={2}
          padding={false}
          visible={!props.hideAssets}
        >
          {props.totalValue}
        </Text.numeral>
      </Flex>
      <Grid cols={2} rows={1} width={"100%"}>
        <Statistic
          label="Unreal. PnL (USDC)"
          classNames={{
            label: "oui-text-2xs oui-text-base-contrast-36",
          }}
        >
          <Flex gap={1}>
            <Text.numeral
              size="xs"
              coloring
              dp={2}
              padding={false}
              visible={!props.hideAssets}
            >
              {props.aggregated.unrealPnL}
            </Text.numeral>
            {!props.hideAssets && (
              <Text.numeral
                size="xs"
                dp={2}
                padding={false}
                rule="percentages"
                prefix={"("}
                suffix={")"}
                className={clsName}
              >
                {props.totalUnrealizedROI}
              </Text.numeral>
            )}
          </Flex>
        </Statistic>
        <Statistic
          label="Unsettled PnL (USDC)"
          classNames={{
            label: "oui-text-2xs oui-text-base-contrast-36",
          }}
        >
          <Flex justify={"between"} width={"100%"}>
            <Text.numeral
              size="xs"
              coloring
              dp={2}
              padding={false}
              visible={!props.hideAssets}
            >
              {props.aggregated.unsettledPnL}
            </Text.numeral>
            <button
              className="oui-flex oui-gap-1 oui-items-center"
              onClick={onUnsettleClick}
            >
              <RefreshIcon opacity={1} color="primary" size={12} />
              <Text size="2xs" color="primary">
                Settle PnL
              </Text>
            </button>
          </Flex>
        </Statistic>
      </Grid>
    </Flex>
  );
};
const MarginRatio: FC<PortfolioSheetState> = (props) => {
  return (
    <Grid cols={2} rows={1} width={"100%"}>
      <Statistic
        label="Margin Ratio"
        classNames={{
          label: "oui-text-2xs oui-text-base-contrast-36",
        }}
      >
        <Text.numeral
          size="xs"
          color="primary"
          dp={2}
          padding={false}
          visible={!props.hideAssets}
        >
          1111
        </Text.numeral>
      </Statistic>
      <Statistic
        label="Free / Total Collateral (USDC)"
        classNames={{
          label: "oui-text-2xs oui-text-base-contrast-36",
        }}
      >
        <Flex justify={"start"} width={"100%"} gap={1}>
          <Text.numeral
            size="xs"
            dp={2}
            padding={false}
            visible={!props.hideAssets}
          >
            1111
          </Text.numeral>
          <Text size="xs">/</Text>
          <Text.numeral
            size="xs"
            dp={2}
            padding={false}
            visible={!props.hideAssets}
          >
            1111
          </Text.numeral>
        </Flex>
      </Statistic>
    </Grid>
  );
};
const Leverage: FC<PortfolioSheetState> = (props) => {
  return (
    <Flex direction={"column"} gap={2} width={"100%"}>
      <Flex width={"100%"} justify={"between"}>
        <Text size="2xs" intensity={54}>
          Max account leverage
        </Text>
        <Text.numeral
          size="2xs"
          // @ts-ignore
          prefix={
            <Text size="2xs" intensity={54}>
              {"Current: "}
            </Text>
          }
          suffix="x"
        >
          {1.29}
        </Text.numeral>
      </Flex>
      <Slider markCount={4} />
    </Flex>
  );
};
const AvaiableBalance: FC<PortfolioSheetState> = (props) => {
  return (
    <Flex
      width={"100%"}
      justify={"between"}
      r="lg"
      px={3}
      py={4}
      className="oui-bg-base-6"
    >
      <Text size="2xs" intensity={80}>
        Available Balance
      </Text>
      <Flex className="oui-gap-[6px]">
        <USDCIcon size={24} />
        <Text.numeral dp={2} size="base" visible={!props.hideAssets}>
          {123.223}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};
const Buttons: FC<PortfolioSheetState> = (props) => {
  return (
    <Grid
      cols={2}
      rows={1}
      gap={3}
      className="oui-grid-row-[1fr,1fr]"
      width={"100%"}
      pt={2}
      pb={4}
    >
      <Button
        icon={<ArrowUpShortIcon color="white" opacity={0.8} />}
        size="md"
        fullWidth
        className="oui-bg-base-2"
      >
        Withdraw
      </Button>
      <Button
        icon={<ArrowUpShortIcon color="white" opacity={0.8} />}
        size="md"
        fullWidth
      >
        Deposit
      </Button>
    </Grid>
  );
};
