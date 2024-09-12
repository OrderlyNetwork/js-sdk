import React, { FC, useMemo, useState } from "react";
import {
  Flex,
  Text,
  Box,
  Button,
  ArrowDownShortIcon,
  EyeIcon,
  EyeCloseIcon,
  ChevronDownIcon,
  Tooltip
} from "@orderly.network/ui";
import { AssetViewState } from "./assetView.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AccountStatusEnum, OrderEntity } from "@orderly.network/types";
import {
  cn,
  Collapsible,
  CollapsibleContent,
  Divider,
} from "@orderly.network/react";
import {
  useAccount,
  useCollateral,
  useLocalStorage,
  useMarginRatio,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

const TotalValue: FC<{
  totalValue: number | null;
  visible?: boolean;
  onToggleVisibility?: () => void;
}> = (props) => {
  const { totalValue = 0, visible = true, onToggleVisibility } = props;
  return (
    <Flex
      direction={"column"}
      gap={1}
      className="oui-text-2xs"
      itemAlign={"center"}
    >
      <Text.numeral
        visible={props.visible}
        weight="bold"
        size="2xl"
        unitClassName="oui-text-transparent oui-bg-clip-text"
        style={{
          backgroundImage: "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        as="div"
      >
        {totalValue ?? "--"}
      </Text.numeral>

      <Flex gap={1} itemAlign={"center"}>
        <Text size="2xs" color="neutral" weight="semibold">
          My Assets (USDC)
        </Text>

        <button onClick={() => onToggleVisibility?.()}>
          {visible ? (
            <EyeIcon
              size={18}
              className="oui-text-base-contrast-54"
              opacity={0.5}
            />
          ) : (
            <EyeCloseIcon
              size={18}
              className="oui-text-base-contrast-54"
              opacity={0.5}
            />
          )}
        </button>
      </Flex>
    </Flex>
  );
};

const AssetValueList: FC<{
  totalValue?: number | null;
  visible?: boolean;
  onToggleVisibility?: () => void;
}> = (props) => {
  const [optionsOpen, setOptionsOpen] = useLocalStorage(
    "order_entry_asset_list_open",
    false
  );
  const [open, setOpen] = useState<boolean>(optionsOpen);
  const { state } = useAccount();

  const { freeCollateral } = useCollateral({
    dp: 2,
  });

  const isConnected = state.status >= AccountStatusEnum.Connected;
  const { marginRatio } = useMarginRatio();
  const marginRatioVal = marginRatio === 0 ? 10 : Math.min(marginRatio, 10);

  const { mmr } = useMarginRatio();
  const renderMMR = useMemo(() => {
    if (!mmr) {
      return "-";
    }
    const bigMMR = new Decimal(mmr);
    return bigMMR.mul(100).todp(2, 0).toFixed(2);
  }, [mmr]);

  return (
    <Box>
      <Flex
        justify="center"
        gap={1}
        itemAlign={"center"}
        className="oui-cursor-pointer"
        onClick={() => {
          setOpen((open) => !open);
          setOptionsOpen(!open);
        }}
      >
        <div className="oui-h-[1px] oui-bg-white/30 oui-w-full oui-flex-1" />
        <ChevronDownIcon
          size={18}
          className={cn(
            "oui-transition-transform oui-text-base-contrast/50",
            open && "orderly-rotate-180"
          )}
          opacity={0.5}
        />
        <div className="oui-h-[1px] oui-bg-white/30 oui-w-full oui-flex-1" />
      </Flex>

      <Collapsible open={open}>
        <CollapsibleContent>
          <Box className="oui-space-y-1.5">
            <Flex justify="between">
              <Tooltip
                content={
                  <div>
                    <span>Free collateral for placing new orders.</span>
                    <Divider className="orderly-py-2 orderly-border-white/10" />
                    <span>
                      Free collateral = Total balance + Total unsettlement PnL -
                      Total position initial margin
                    </span>
                  </div> as any
                }
              >
                <Text size="2xs" color="neutral" weight="semibold" className="oui-cursor-pointer">
                  Free collateral
                </Text>
              </Tooltip>
              <Text.numeral
                visible={props.visible}
                size="2xs"
                unit="USDC"
                unitClassName="oui-text-base-contrast-36"
                as="div"
              >
                {freeCollateral ?? "--"}
              </Text.numeral>
            </Flex>

            <Flex justify="between">
              <Tooltip
                content={
                  <div>
                    <span>
                      Your actual Leverage of the whole account / Your max
                      Leverage of the whole account
                    </span>
                    <Divider className="oui-py-2 oui-border-white/10" />
                    <span>
                      Margin ratio = Total collateral / Total position notional
                    </span>
                  </div> as any
                }
              >
                <Text size="2xs" color="neutral" weight="semibold" className="oui-cursor-pointer">
                  Margin ratio
                </Text>
              </Tooltip>
              {isConnected ? (
                <Text.numeral
                  size="2xs"
                  suffix="%"
                  unitClassName="oui-text-base-contrast-36"
                  as="div"
                >
                  {marginRatioVal}
                </Text.numeral>
              ) : (
                <Text className="oui-text-base-contrast-36">--</Text>
              )}
            </Flex>

            <Flex justify="between">
              <Tooltip
                content={
                  <div>
                    <span>Free collateral for placing new orders.</span>
                    <Divider className="orderly-py-2 orderly-border-white/10" />
                    <span>
                      Free collateral = Total balance + Total unsettlement PnL -
                      Total position initial margin
                    </span>
                  </div> as any
                }
              >
                <Text size="2xs" color="neutral" weight="semibold" className="oui-cursor-pointer">
                  Maintenance margin ratio
                </Text>
              </Tooltip>
              {renderMMR ? (
                <Text.numeral
                  size="2xs"
                  suffix="%"
                  unitClassName="oui-text-base-contrast-36"
                  as="div"
                >
                  {renderMMR}
                </Text.numeral>
              ) : (
                <Text className="oui-text-base-contrast-36">--</Text>
              )}
            </Flex>
          </Box>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  );
};

// ui
export const AssetView: FC<AssetViewState> = (props) => {
  const {
    title,
    description,
    titleColor,
    networkId,
    isFirstTimeDeposit,
    totalValue,
  } = props;
  return (
    <Box>
      <Flex direction="column" gap={1} className="oui-mb-[32px]">
        {titleColor ? (
          <Text
            size="lg"
            weight="bold"
            style={{
              color: titleColor,
            }}
          >
            {title}
          </Text>
        ) : (
          <Text
            size="lg"
            weight="bold"
            className="oui-text-transparent oui-bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Text>
        )}

        <Text size="2xs" color="neutral" weight="semibold">
          {description}
        </Text>
      </Flex>
      <AuthGuard
        networkId={networkId}
        status={AccountStatusEnum.EnableTrading}
        buttonProps={{ size: "md", fullWidth: true }}
      >
        {isFirstTimeDeposit ? (
          <>
            <Box>
              <Flex direction="column" gap={1} className="oui-mb-[32px]">
                <Text
                  size="lg"
                  weight="bold"
                  className="oui-text-transparent oui-bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Deposit to start trade
                </Text>
                <Text size="2xs" color="neutral" weight="semibold">
                  You can deposit assets from various networks
                </Text>
              </Flex>
            </Box>
            <Button fullWidth size="md" onClick={props.onDeposit}>
              <ArrowDownShortIcon color="white" />
              <Text>Deposit</Text>
            </Button>
          </>
        ) : <Box className="oui-space-y-4">
          <TotalValue
            totalValue={totalValue}
            visible={props.visible}
            onToggleVisibility={props.toggleVisible}
          />
          <AssetValueList visible={props.visible} />
          <Flex gap={3} itemAlign={"center"}>
            <Button
              fullWidth
              color="secondary"
              size="md"
              onClick={props.onWithdraw}
            >
              <ArrowDownShortIcon color="white" className="oui-rotate-180" />
              <Text>Withdraw</Text>
            </Button>
            <Button fullWidth size="md" onClick={props.onDeposit}>
              <ArrowDownShortIcon color="white" />
              <Text>Deposit</Text>
            </Button>
          </Flex>
        </Box>}
      </AuthGuard>
    </Box>
  );
};
