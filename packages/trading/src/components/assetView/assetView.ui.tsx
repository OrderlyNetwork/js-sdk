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
  Tooltip,
  Divider,
  gradientTextVariants,
} from "@orderly.network/ui";
import { AssetViewState } from "./assetView.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AccountStatusEnum } from "@orderly.network/types";
import { cn, Collapsible, CollapsibleContent } from "@orderly.network/react";
import { useAccount, useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
}

export const useCurrentStatusText = (): StatusInfo => {
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  /**
   * TODO:
   *  script文件不应该包括UI显示的具体数据，建议移动到ui文件中
   *  处理完成之后，请删掉 TODO
   */
  const currentStatus = useMemo(() => {
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
        };
      case AccountStatusEnum.NotSignedIn:
        return {
          title: "Sign in",
          description: "Please sign in before starting to trade.",
          titleColor: "primaryLight",
        };
      case AccountStatusEnum.DisabledTrading:
        return {
          title: "Enable trading",
          description: "Enable trading before starting to trade.",
          titleColor: "primaryLight",
        };
      default:
        return {
          title: "",
          description: "",
        };
    }
  }, [state.status, wrongNetwork]);

  return currentStatus;
};


const TotalValue: FC<{
  totalValue: number | null;
  visible?: boolean;
  onToggleVisibility?: () => void;
}> = ({ totalValue = 0, visible = true, onToggleVisibility }) => {
  return (
    <Flex
      direction={"column"}
      gap={1}
      className="oui-text-2xs"
      itemAlign={"center"}
    >
      <Text.numeral
        visible={visible}
        weight="bold"
        size="2xl"
        className={gradientTextVariants({ color: "brand" })}
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
              />
            ) : (
              <EyeCloseIcon
              size={18}
              className="oui-text-base-contrast-54"
            />
          )}
        </button>
      </Flex>
    </Flex>
  );
};

const AssetValueList: FC<{
  visible?: boolean;
  freeCollateral: number | null;
  marginRatioVal: number;
  renderMMR: string;
  isConnected: boolean;
}> = ({
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

  return (
    <Box>
      <Flex
        justify="center"
        gap={1}
        itemAlign={"center"}
        className="oui-cursor-pointer"
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
          setOptionsOpen(!open);
        }}
      >
        <Divider className="oui-flex-1" />
        <ChevronDownIcon
          size={18}
          color="white"
          className={cn("oui-transition-transform", open && "oui-rotate-180")}
        />
        <Divider className="oui-flex-1" />
      </Flex>

      <Collapsible open={open}>
        <CollapsibleContent>
          <Box className="oui-space-y-1.5">
            <Flex justify="between">
              <Tooltip
                content={
                  (
                    <div>
                      <span>Free collateral for placing new orders.</span>
                      <Divider className="oui-py-2 oui-border-white/10" />
                      <span>
                        Free collateral = Total balance + Total unsettlement PnL
                        - Total position initial margin
                      </span>
                    </div>
                  ) as any
                }
              >
                <Text
                  size="2xs"
                  color="neutral"
                  weight="semibold"
                  className="oui-cursor-pointer"
                >
                  Free collateral
                </Text>
              </Tooltip>
              <Text.numeral
                visible={visible}
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
                  (
                    <div>
                      <span>
                        Your actual Leverage of the whole account / Your max
                        Leverage of the whole account
                      </span>
                      <Divider className="oui-py-2 oui-border-white/10" />
                      <span>
                        Margin ratio = Total collateral / Total position
                        notional
                      </span>
                    </div>
                  ) as any
                }
              >
                <Text
                  size="2xs"
                  color="neutral"
                  weight="semibold"
                  className="oui-cursor-pointer"
                >
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
                  (
                    <div>
                      <span>Maintenance margin ratio.</span>
                      <Divider className="oui-py-2 oui-border-white/10" />
                      <span>Maintenance margin ratio = ...</span>
                    </div>
                  ) as any
                }
              >
                <Text
                  size="2xs"
                  color="neutral"
                  weight="semibold"
                  className="oui-cursor-pointer"
                >
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
  const currentStatus = useCurrentStatusText();
  const { title, description } = currentStatus;
  const titleColor = currentStatus.titleColor ?? "";

  return (
    <Box>
      {title && description ? (
        <Flex direction="column" gap={1} className="oui-mb-[32px]">
          {titleColor ? (
            <Text size="lg" weight="bold" color={titleColor}>
              {title}
            </Text>
          ) : (
            <Text.gradient size="lg" weight="bold" color={"brand"}>
              {title}
            </Text.gradient>
          )}

          <Text size="2xs" color="neutral" weight="semibold">
            {description}
          </Text>
        </Flex>
      ) : null}
      <AuthGuard
        networkId={networkId}
        status={AccountStatusEnum.EnableTrading}
        buttonProps={{ size: "md", fullWidth: true }}
      >
        {isFirstTimeDeposit ? (
          <>
            <Box>
              <Flex direction="column" gap={1} className="oui-mb-[32px]">
                <Text.gradient size="lg" weight="bold" color={"brand"}>
                  Deposit to start trade
                </Text.gradient>
                <Text size="2xs" color="neutral" weight="semibold">
                  You can deposit assets from various networks
                </Text>
              </Flex>
            </Box>
            <Button fullWidth size="md" onClick={onDeposit}>
              <ArrowDownShortIcon color="white" opacity={1} />
              <Text>Deposit</Text>
            </Button>
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
            <Flex gap={3} itemAlign={"center"}>
              <Button
                fullWidth
                color="secondary"
                size="md"
                onClick={onWithdraw}
              >
                <ArrowDownShortIcon
                  color="white"
                  opacity={1}
                  className="oui-rotate-180"
                />
                <Text>Withdraw</Text>
              </Button>
              <Button fullWidth size="md" onClick={onDeposit}>
                <ArrowDownShortIcon color="white" opacity={1} />
                <Text>Deposit</Text>
              </Button>
            </Flex>
          </Box>
        )}
      </AuthGuard>
    </Box>
  );
};
