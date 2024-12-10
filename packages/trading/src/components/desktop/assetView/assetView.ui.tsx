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
  Collapsible,
  CollapsibleContent,
} from "@orderly.network/ui";
import { AssetViewState } from "./assetView.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAccount, useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { FaucetWidget } from "./faucet/faucet.widget";

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
  const { wrongNetwork } = useAppContext();

  return useMemo(() => {
    if (wrongNetwork) {
      return {
        title: "Wrong Network",
        description: "Please switch to a supported network to continue.",
        titleColor: "warning",
      };
    }

    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return {
          title: "Connect wallet",
          description: "Please connect your wallet before starting to trade.",
          titleClsName:
            "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
        };
      case AccountStatusEnum.NotSignedIn:
        return {
          title: "Sign in",
          description: "Please sign in before starting to trade.",
          titleColor: "primary",
        };
      case AccountStatusEnum.DisabledTrading:
        return {
          title: "Enable trading",
          description: "Enable trading before starting to trade.",
          titleColor: "primary",
        };
      default:
        return {
          title: "",
          description: "",
        };
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
}) => (
  <Flex direction="column" gap={1} className="oui-text-2xs" itemAlign="center">
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
        My Assets (USDC)
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
          label="Free collateral"
          description="Free collateral for placing new orders."
          formula="Free collateral = Total balance + Total unsettlement PnL - Total position initial margin"
          visible={visible}
          // TODO: change AssetDetail value
          value={freeCollateral! === 0 ? ("0" as any) : freeCollateral}
          unit="USDC"
        />
        <AssetDetail
          label="Margin ratio"
          description="The margin ratio represents the proportion of collateral relative to the total position value."
          formula="Account margin ratio = (Total collateral value / Total position notional) * 100%"
          visible={visible}
          value={marginRatioVal}
          isConnected={isConnected}
          rule="percentages"
          showPercentage={true}
          placeholder="--%"
        />
        <AssetDetail
          label="Maintenance margin ratio"
          description="The minimum margin ratio required to protect your positions from being liquidated. If the Margin ratio falls below the Maintenance margin ratio, the account will be liquidated."
          formula="Account maintenance margin ratio = Sum(Position notional * Symbol maintenance Margin Ratio)  / Total position notional * 100%"
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
        status={AccountStatusEnum.EnableTrading}
        buttonProps={{ size: "md", fullWidth: true }}
      >
        {isFirstTimeDeposit ? (
          <>
            <Box>
              <Flex direction="column" gap={1} className="oui-mb-[32px]">
                <Text.gradient size="lg" weight="bold" color="brand">
                  Deposit to start trade
                </Text.gradient>
                <Text size="2xs" color="neutral" weight="semibold">
                  You can deposit assets from various networks
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
              <Text>Deposit</Text>
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
                <Text>Withdraw</Text>
              </Button>
              <Button
                data-testid="oui-testid-assetView-deposit-button"
                fullWidth
                size="md"
                onClick={onDeposit}
              >
                <ArrowDownShortIcon color="white" opacity={1} />
                <Text>Deposit</Text>
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
