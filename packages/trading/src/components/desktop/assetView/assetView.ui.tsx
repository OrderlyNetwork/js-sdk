import React, { FC, useMemo, useState, useCallback, ReactNode } from "react";
import {
  Flex,
  Text,
  Box,
  Button,
  ArrowDownShortIcon,
  EyeIcon,
  EyeCloseIcon,
  ChevronDownIcon,
  Tooltip,
  Divider,
  gradientTextVariants,
  cn,
} from "@orderly.network/ui";
import { AssetViewState } from "./assetView.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAccount, useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { FaucetWidget } from "./faucet/faucet.widget";
import { useTranslation } from "@orderly.network/i18n";
interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
  titleClsName?: string;
}

interface TooltipContentProps {
  description: ReactNode;
  formula: ReactNode;
}

interface TotalValueProps {
  totalValue?: number;
  visible?: boolean;
  onToggleVisibility?: () => void;
}

interface AssetDetailProps {
  label: string;
  description: ReactNode;
  formula: ReactNode;
  visible: boolean;
  value?: number | string;
  unit?: string;
  rule?: "percentages";
  isConnected?: boolean;
  showPercentage?: boolean;
  placeholder?: string;
}

interface AssetValueListProps {
  visible?: boolean;
  freeCollateral?: number | null;
  marginRatioVal?: number;
  renderMMR?: string | number;
  isConnected: boolean;
}

const useCurrentStatusText = (): StatusInfo => {
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const { t } = useTranslation();

  return useMemo(() => {
    const statusText = {
      wrongNetwork: {
        title: t("connector.wrongNetwork"),
        description: t("connector.wrongNetwork.tooltip"),
        titleColor: "warning",
      },
      connectWallet: {
        title: t("connector.connectWallet"),
        description: t("connector.trade.connectWallet.tooltip"),
        titleClsName:
          "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
      },
      notSignedIn: {
        title: t("connector.signIn"),
        description: t("connector.trade.signIn.tooltip"),
        titleColor: "primary",
      },
      disabledTrading: {
        title: t("connector.enableTrading"),
        description: t("connector.trade.enableTrading.tooltip"),
        titleColor: "primary",
      },
      default: {
        title: "",
        description: "",
      },
    };

    if (disabledConnect) {
      return statusText.connectWallet;
    }

    if (wrongNetwork) {
      return statusText.wrongNetwork;
    }

    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return statusText.connectWallet;
      case AccountStatusEnum.NotSignedIn:
        return statusText.notSignedIn;
      case AccountStatusEnum.DisabledTrading:
        return statusText.disabledTrading;
      default:
        return statusText.default;
    }
  }, [state.status, wrongNetwork]);
};

export const TooltipContent: FC<TooltipContentProps> = ({
  description,
  formula,
}) => (
  <div className="oui-leading-[1.5] oui-text-2xs oui-text-base-contrast-80 oui-min-w-[204px] oui-max-w-[240px]">
    <span>{description}</span>
    <Divider className="oui-border-white/10" my={2} />
    <span>{formula}</span>
  </div>
);

const TotalValue: FC<TotalValueProps> = ({
  totalValue,
  visible = true,
  onToggleVisibility,
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      gap={1}
      className="oui-text-2xs"
      itemAlign="center"
    >
      <Text.numeral
        visible={visible}
        weight="bold"
        size="2xl"
        className={gradientTextVariants({ color: "brand" })}
        as="div"
        padding={false}
        dp={2}
      >
        {totalValue ?? "--"}
      </Text.numeral>
      <Flex gap={1} itemAlign="center">
        <Text size="2xs" color="neutral" weight="semibold">
          {`${t("trading.asset.myAssets")} (USDC)`}
        </Text>
        <button onClick={onToggleVisibility}>
          {visible ? (
            <EyeIcon size={18} className="oui-text-base-contrast-54" />
          ) : (
            <EyeCloseIcon size={18} className="oui-text-base-contrast-54" />
          )}
        </button>
      </Flex>
    </Flex>
  );
};

const AssetDetail: FC<AssetDetailProps> = ({
  label,
  description,
  formula,
  visible,
  value,
  unit,
  rule,
  isConnected,
  showPercentage = false,
  placeholder,
}) => (
  <Flex justify="between">
    <Tooltip
      content={
        (<TooltipContent description={description} formula={formula} />) as any
      }
    >
      <Text
        size="2xs"
        color="neutral"
        weight="semibold"
        className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12"
      >
        {label}
      </Text>
    </Tooltip>
    <Text.numeral
      visible={visible}
      size="2xs"
      unit={unit}
      unitClassName="oui-text-base-contrast-36 oui-ml-0.5"
      as="div"
      rule={rule}
      padding={false}
      dp={2}
      // suffix={value && unit}
      placeholder={placeholder}
    >
      {value || "--"}
    </Text.numeral>
  </Flex>
);

const AssetValueList: FC<AssetValueListProps> = ({
  visible = true,
  freeCollateral,
  marginRatioVal,
  renderMMR,
  isConnected,
}) => {
  const [optionsOpen, setOptionsOpen] = useLocalStorage(
    "orderly_entry_asset_list_open",
    false
  );
  const [open, setOpen] = useState<boolean>(optionsOpen);

  const { t } = useTranslation();

  const toggleOpen = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
    setTimeout(() => {
      setOptionsOpen(!open);
    }, 0);
  }, []);

  return (
    <Box className="oui-group">
      <Flex
        justify="center"
        gap={1}
        itemAlign="center"
        className="oui-cursor-pointer"
        onClick={toggleOpen}
      >
        <Divider className="oui-flex-1" />
        <ChevronDownIcon
          size={12}
          color="white"
          className={cn("oui-transition-transform", open && "oui-rotate-180")}
        />
        <Divider className="oui-flex-1" />
      </Flex>

      <Box
        style={{
          transform: "translateZ(0)",
        }}
        className={cn(
          "oui-space-y-1.5 oui-select-none oui-overflow-hidden",
          "oui-transition-[max-height] oui-duration-150",
          "group-hover:oui-will-change-[max-height]",
          open ? "oui-max-h-[69px]" : "oui-max-h-0"
        )}
      >
        <AssetDetail
          label={t("trading.asset.freeCollateral")}
          description={t("trading.asset.freeCollateral.tooltip")}
          formula={t("trading.asset.freeCollateral.formula")}
          visible={visible}
          // TODO: change AssetDetail value
          value={freeCollateral! === 0 ? ("0" as any) : freeCollateral}
          unit="USDC"
        />
        <AssetDetail
          label={t("trading.asset.marginRatio")}
          description={t("trading.asset.marginRatio.tooltip")}
          formula={t("trading.asset.marginRatio.formula")}
          visible={visible}
          value={marginRatioVal}
          isConnected={isConnected}
          rule="percentages"
          showPercentage={true}
          placeholder="--%"
        />
        <AssetDetail
          label={t("trading.asset.maintenanceMarginRatio")}
          description={t("trading.asset.maintenanceMarginRatio.tooltip")}
          formula={t("trading.asset.maintenanceMarginRatio.formula")}
          visible={visible}
          value={renderMMR}
          rule="percentages"
          showPercentage={true}
          placeholder="--%"
        />
      </Box>
    </Box>
  );
};

export const AssetView: FC<AssetViewState> = ({
  networkId,
  isFirstTimeDeposit,
  totalValue,
  onDeposit,
  onWithdraw,
  toggleVisible,
  visible,
  freeCollateral,
  marginRatioVal,
  renderMMR,
  isConnected,
}) => {
  const { title, description, titleColor, titleClsName } =
    useCurrentStatusText();

  const { t } = useTranslation();

  return (
    <Box className="oui-relative">
      {title && description && (
        <Flex direction="column" gap={1} className="oui-mb-[32px]">
          <Text
            size="lg"
            weight="bold"
            color={titleColor || "inherit"}
            className={titleClsName}
          >
            {title}
          </Text>
          <Text
            size="2xs"
            color="neutral"
            weight="semibold"
            className="oui-text-center"
          >
            {description}
          </Text>
        </Flex>
      )}
      <AuthGuard
        networkId={networkId}
        buttonProps={{ size: "md", fullWidth: true }}
      >
        {isFirstTimeDeposit ? (
          <>
            <Box>
              <Flex direction="column" gap={1} className="oui-mb-[32px]">
                <Text.gradient size="lg" weight="bold" color="brand">
                  {t("trading.asset.startTrading")}
                </Text.gradient>
                <Text size="2xs" color="neutral" weight="semibold">
                  {t("trading.asset.startTrading.description")}
                </Text>
              </Flex>
            </Box>
            <Button
              data-testid="oui-testid-assetView-deposit-button"
              fullWidth
              size="md"
              onClick={onDeposit}
            >
              <ArrowDownShortIcon color="white" opacity={1} />
              <Text>{t("transfer.deposit")}</Text>
            </Button>

            <Box className="oui-mt-3">
              <FaucetWidget />
            </Box>
          </>
        ) : (
          <Box className="oui-space-y-4">
            <TotalValue
              totalValue={totalValue}
              visible={visible}
              onToggleVisibility={toggleVisible}
            />
            <AssetValueList
              visible={visible}
              freeCollateral={freeCollateral}
              marginRatioVal={marginRatioVal}
              renderMMR={renderMMR}
              isConnected={isConnected}
            />
            <Flex gap={3} itemAlign="center">
              <Button
                fullWidth
                color="secondary"
                size="md"
                onClick={onWithdraw}
                data-testid="oui-testid-assetView-withdraw-button"
              >
                <ArrowDownShortIcon
                  color="white"
                  opacity={1}
                  className="oui-rotate-180"
                />
                <Text>{t("transfer.withdraw")}</Text>
              </Button>
              <Button
                data-testid="oui-testid-assetView-deposit-button"
                fullWidth
                size="md"
                onClick={onDeposit}
              >
                <ArrowDownShortIcon color="white" opacity={1} />
                <Text>{t("transfer.deposit")}</Text>
              </Button>
            </Flex>
            <FaucetWidget />
          </Box>
        )}
      </AuthGuard>
      <div
        className="oui-pointer-events-none oui-rotate-180 oui-rounded-2xl oui-blur-[200px] oui-top-0 oui-bottom-0 oui-left-0 oui-right-0 oui-absolute"
        style={{
          background:
            "conic-gradient(from -40.91deg at 40.63% 50.41%, rgba(159, 115, 241, 0) -48.92deg, rgba(242, 98, 181, 0) 125.18deg, #5FC5FF 193.41deg, #FFAC89 216.02deg, #8155FF 236.07deg, #789DFF 259.95deg, rgba(159, 115, 241, 0) 311.08deg, rgba(242, 98, 181, 0) 485.18deg)",
        }}
      />
    </Box>
  );
};
