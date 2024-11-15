import { FC, useCallback } from "react";
import {
  ArrowDownShortIcon,
  ArrowUpShortIcon,
  Button,
  cn,
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
import {
  getMarginRatioColor,
  PortfolioSheetState,
} from "./portfolioSheet.script";
import { USDCIcon } from "../accountSheet/icons";
import { RiskIndicator } from "./riskIndicator";

export const PortfolioSheet: FC<PortfolioSheetState> = (props) => {
  return (
    <Flex direction={"column"} gap={4} width={"100%"}>
      <Asset {...props} />
      <Divider className="oui-w-full" />
      <MarginRatio {...props} />
      <Leverage {...props} />
      {/* <Divider className="oui-w-full" /> */}
      {/* <AvailableBalance {...props} /> */}
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
              <EyeIcon
                opacity={1}
                size={16}
                className="oui-text-primary-light"
              />
            ) : (
              <EyeCloseIcon
                opacity={1}
                size={16}
                className="oui-text-primary-light"
              />
            )
          }
          onClick={(e) => {
            props.toggleHideAssets();
          }}
          className="oui-cursor-pointer"
        >
          Total value (USDC)
        </Text.formatted>
        <Text.numeral
          size="base"
          // coloring
          dp={2}
          padding={false}
          visible={!props.hideAssets}
        >
          {props.totalValue ?? '--'}
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
              <RefreshIcon
                opacity={1}
                size={12}
                className="oui-text-primary-light"
              />
              <Text size="2xs" color="primaryLight">
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
  const { high, mid, low } = getMarginRatioColor(
    props.marginRatioVal,
    props.mmr
  );

  return (
    <Grid cols={2} rows={1} width={"100%"}>
      <Statistic
        label="Margin Ratio"
        classNames={{
          label: "oui-text-2xs oui-text-base-contrast-36",
        }}
      >
        <Flex gap={2}>
          <Text.numeral
            size="xs"
            rule="percentages"
            color="primaryLight"
            dp={2}
            padding={false}
            visible={!props.hideAssets}
          >
            {props.marginRatioVal}
          </Text.numeral>
          {!props.hideAssets && (
            <RiskIndicator
              className={
                low
                  ? "oui-rotate-0"
                  : mid
                  ? "oui-rotate-90"
                  : high
                  ? "oui-rotate-180"
                  : ""
              }
            />
          )}
        </Flex>
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
            {props.freeCollateral}
          </Text.numeral>
          <Text size="xs">/</Text>
          <Text.numeral
            size="xs"
            dp={2}
            padding={false}
            visible={!props.hideAssets}
          >
            {props.totalCollateral}
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
          {props.currentLeverage ?? '--'}
        </Text.numeral>
      </Flex>
      <Slider
        step={1}
        max={props.maxLeverage - 1}
        // markLabelVisible={true}
        // marks={props.marks}
        markCount={5}
        value={[props.value]}
        onValueChange={(e) => {
          props.onLeverageChange(e[0]);
          props.setShowSliderTip(true);
        }}
        color="primaryLight"
        onValueCommit={(e) => {
          props.onValueCommit(e);
          props.setShowSliderTip(false);
        }}
        showTip={props.showSliderTip}
        tipFormatter={(value, min, max, percent) => {
          return `${value+1}x`;
        }}
      />
      <Flex justify={"between"} width={"100%"}>
        {[1, 10, 20, 30, 40, 50].map((item, index) => {
          return (
            <button
              onClick={(e) => {
                props.onSaveLeverage(item);
                props.onLeverageChange(item - 1);
              }}
              className={cn(
                " oui-text-2xs oui-pb-2",
                index === 0
                  ? "oui-pr-2"
                  : index === 4
                  ? "oui-pl-2"
                  : "oui-px-2",
                item - 1 >= 0 && "oui-text-primary-light"
              )}
            >
              {`${item}x`}
            </button>
          );
        })}
      </Flex>
    </Flex>
  );
};
const AvailableBalance: FC<PortfolioSheetState> = (props) => {
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
          {props.availableBalance}
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
        className="oui-bg-base-2 hover:oui-bg-base-2/50"
        onClick={props.onWithdraw}
      >
        Withdraw
      </Button>
      <Button
        icon={<ArrowDownShortIcon color="white" opacity={0.8} />}
        size="md"
        fullWidth
        onClick={props.onDeposit}
      >
        Deposit
      </Button>
    </Grid>
  );
};
