import { FC, useCallback } from "react";
import {
  ArrowDownShortIcon,
  ArrowUpShortIcon,
  Button,
  Divider,
  EyeCloseIcon,
  EyeIcon,
  Flex,
  Grid,
  modal,
  RefreshIcon,
  Statistic,
  Text,
} from "@orderly.network/ui";
import {
  getMarginRatioColor,
  PortfolioSheetState,
} from "./portfolioSheet.script";
import { USDCIcon } from "../accountSheet/icons";
import { RiskIndicator } from "./riskIndicator";
import { LeverageSlider } from "@orderly.network/ui-leverage";
import { Trans, useTranslation } from "@orderly.network/i18n";

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
  const { t } = useTranslation();

  const onUnsettleClick = useCallback(() => {
    return modal.confirm({
      title: t("settle.settlePnl"),
      // maxWidth: "xs",
      content: (
        <Text intensity={54} size="xs">
          {/* @ts-ignore */}
          <Trans i18nKey="settle.settlePnl.description" />
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
  }, [t]);

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
          {`${t("trading.asset.totalValue")} (USDC)`}
        </Text.formatted>
        <Text.numeral
          size="base"
          // coloring
          dp={2}
          padding={false}
          visible={!props.hideAssets}
        >
          {props.totalValue ?? "--"}
        </Text.numeral>
      </Flex>
      <Grid cols={2} rows={1} width={"100%"}>
        <Statistic
          label={`${t("trading.asset.unrealPnl")} (USDC)`}
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
          label={`${t("trading.asset.unsettledPnl")} (USDC)`}
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
              <Text size="2xs" color="primary">
                {t("settle.settlePnl")}
              </Text>
            </button>
          </Flex>
        </Statistic>
      </Grid>
    </Flex>
  );
};
const MarginRatio: FC<PortfolioSheetState> = (props) => {
  const { t } = useTranslation();

  const { high, mid, low } = getMarginRatioColor(
    props.marginRatioVal,
    props.mmr
  );

  return (
    <Grid cols={2} rows={1} width={"100%"}>
      <Statistic
        label={t("trading.asset.marginRatio")}
        classNames={{
          label: "oui-text-2xs oui-text-base-contrast-36",
        }}
      >
        <Flex gap={2}>
          <Text.numeral
            size="xs"
            rule="percentages"
            color="primary"
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
        label={`${t("trading.asset.free&TotalCollateral")} (USDC)`}
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
  const { t } = useTranslation();

  return (
    <Flex direction={"column"} gap={2} width={"100%"}>
      <Flex width={"100%"} justify={"between"}>
        <Text size="2xs" intensity={54}>
          {t("leverage.maxAccountLeverage")}
        </Text>

        <Flex gap={1}>
          <Text size="2xs" intensity={54}>
            {`${t("leverage.current")}:`}
          </Text>
          <Text.numeral size="2xs" unit="x" intensity={98}>
            {props.currentLeverage ?? "--"}
          </Text.numeral>
        </Flex>
      </Flex>
      <LeverageSlider
        value={props.value}
        maxLeverage={props.maxLeverage}
        onLeverageChange={props.onLeverageChange}
        setShowSliderTip={props.setShowSliderTip}
        showSliderTip={props.showSliderTip}
        onValueCommit={props.onValueCommit}
      />
    </Flex>
  );
};

// const AvailableBalance: FC<PortfolioSheetState> = (props) => {
//   return (
//     <Flex
//       width={"100%"}
//       justify={"between"}
//       r="lg"
//       px={3}
//       py={4}
//       className="oui-bg-base-6"
//     >
//       <Text size="2xs" intensity={80}>
//         Available Balance
//       </Text>
//       <Flex className="oui-gap-[6px]">
//         <USDCIcon size={24} />
//         <Text.numeral dp={2} size="base" visible={!props.hideAssets}>
//           {props.availableBalance}
//         </Text.numeral>
//       </Flex>
//     </Flex>
//   );
// };

const Buttons: FC<PortfolioSheetState> = (props) => {
  const { t } = useTranslation();

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
        {t("transfer.withdraw")}
      </Button>
      <Button
        icon={<ArrowDownShortIcon color="white" opacity={0.8} />}
        size="md"
        fullWidth
        onClick={props.onDeposit}
      >
        {t("transfer.deposit")}
      </Button>
    </Grid>
  );
};
