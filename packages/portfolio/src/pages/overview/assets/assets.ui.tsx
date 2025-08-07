import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Card,
  Divider,
  Flex,
  Grid,
  Either,
  Statistic,
  Text,
  EyeIcon,
  gradientTextVariants,
  EditIcon,
  EyeCloseIcon,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AssetScriptReturn } from "./assets.script";
import { AssetsHeader } from "./assetsHeader";

export const AssetsUI = (
  props: AssetScriptReturn & { onConnectWallet?: () => void },
) => {
  const { t } = useTranslation();
  return (
    <Card
      classNames={{
        footer: "oui-h-[48px]",
        root: "oui-h-[240px]",
      }}
      title={
        <AssetsHeader
          disabled={!props.canTrade}
          isMainAccount={props.isMainAccount}
          onDeposit={props.onDeposit}
          onWithdraw={props.onWithdraw}
          onTransfer={props.onTransfer}
          hasSubAccount={props.hasSubAccount}
        />
      }
    >
      <>
        <Statistic
          label={
            <Flex gap={1}>
              <Text intensity={54}>{t("common.totalValue")}</Text>
              <button
                onClick={() => {
                  props.toggleVisible();
                }}
                data-testid="oui-testid-portfolio-assets-eye-btn"
              >
                {props.visible ? (
                  <EyeIcon size={16} color={"white"} />
                ) : (
                  <EyeCloseIcon size={16} color={"white"} />
                )}
              </button>
            </Flex>
          }
        >
          <Either value={props.canTrade!} left={<NoValue />}>
            <Text.numeral
              visible={props.visible}
              unit="USDC"
              // @ts-ignore
              style={{ "--oui-gradient-angle": "45deg" }}
              unitClassName="oui-text-base oui-text-base-contrast-80 oui-h-9 oui-ml-1"
              className={gradientTextVariants({
                className: "oui-font-bold oui-text-3xl",
                color: "brand",
              })}
            >
              {props.portfolioValue ?? "--"}
            </Text.numeral>
          </Either>
        </Statistic>
        <Divider className="oui-my-4" intensity={8} />
        <AuthGuard buttonProps={{ size: "lg", fullWidth: true }}>
          <AssetStatistic
            unrealROI={props.unrealROI}
            unrealPnL={props.unrealPnL}
            freeCollateral={props.freeCollateral}
            currentLeverage={props.currentLeverage}
            onLeverageEdit={props.onLeverageEdit}
            visible={props.visible}
          />
        </AuthGuard>
      </>
    </Card>
  );
};

const NoValue: FC = () => {
  return (
    <Flex gap={1} className={"oui-h-9"}>
      <Text.gradient color="brand" weight="bold">
        --
      </Text.gradient>
      <Text>USDC</Text>
    </Flex>
  );
};

type AssetStatisticProps = Pick<
  AssetScriptReturn,
  | "currentLeverage"
  | "unrealPnL"
  | "unrealROI"
  | "freeCollateral"
  | "onLeverageEdit"
  | "visible"
>;

export const AssetStatistic = (props: AssetStatisticProps) => {
  const { t } = useTranslation();

  return (
    <Grid cols={3} className="oui-h-12">
      <Statistic label={t("common.unrealizedPnl")}>
        <Flex>
          <Text.numeral
            coloring
            size="lg"
            weight="semibold"
            visible={props.visible}
          >
            {props.unrealPnL}
          </Text.numeral>
          <Text.numeral
            coloring
            rule="percentages"
            size="sm"
            weight="semibold"
            prefix={"("}
            suffix=")"
            visible={props.visible}
          >
            {props.unrealROI}
          </Text.numeral>
        </Flex>
      </Statistic>
      <Statistic label={t("leverage.maxAccountLeverage")}>
        <Flex itemAlign={"center"}>
          <span
            data-testid="oui-testid-portfolio-assets-maxAccountLeverage-value"
            className="oui-text-lg"
          >
            {props.currentLeverage}
          </span>
          <span>x</span>
          <button
            className="oui-ml-1"
            onClick={() => props.onLeverageEdit?.()}
            data-testid="oui-testid-portfolio-assets-maxAccountLeverage-edit-btn"
          >
            <EditIcon color={"white"} size={18} />
          </button>
        </Flex>
      </Statistic>
      <Statistic
        label={t("portfolio.overview.availableWithdraw")}
        // @ts-ignore
        align="right"
        // @ts-ignore
        valueProps={{ size: "lg", visible: props.visible }}
      >
        {props.freeCollateral}
      </Statistic>
    </Grid>
  );
};
