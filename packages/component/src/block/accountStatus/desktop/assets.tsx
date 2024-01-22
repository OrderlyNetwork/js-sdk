import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Numeral } from "@/text";
import { Progress } from "@/progress";

import { ChevronDown, RefreshCcw } from "lucide-react";
import {
  useLocalStorage,
  useCollateral,
  usePositionStream,
  useMarginRatio,
  useAccount,
  useConfig,
  useWalletConnector,
  useMutation,
} from "@orderly.network/hooks";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/collapsible/collapsible";
import { toast } from "@/toast";
import { MemorizedLeverage } from "@/block/accountStatus/desktop/leverage";
import { MemorizedAssetsDetail } from "@/block/accountStatus/desktop/assetsDetail";
import Button from "@/button";
import { NetworkImage } from "@/icon";
import { AccountStatusEnum } from "@orderly.network/types";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@/modal";
import { ConfigStore } from "@orderly.network/core";
import { cn } from "@/utils/css";
import { isTestnet } from "@orderly.network/utils";
import { Divider } from "@/divider";

interface AssetsProps {
  totalBalance: number;
}

const KEY = "ORDERLY_WEB_ASSETS_COLLAPSED";

export const Assets: FC<AssetsProps> = (props) => {
  // const [expand, { toggle }] = useBoolean(false);

  const [collapsed, setCollapsed] = useLocalStorage(KEY, 1);
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });

  const [disableGetTestUSDC, setDisableGetTestUSDC] = useState(false);
  const { connectedChain } = useWalletConnector();

  const { account, state } = useAccount();
  const showGetTestUSDC = useMemo(() => {
    const chainId = connectedChain?.id;
    if (chainId === undefined) {
      return false;
    }

    return (
      state.status === AccountStatusEnum.EnableTrading &&
      isTestnet(parseInt(chainId))
    );
  }, [state.status, connectedChain]);

  const [getTestUSDC, { isMutating }] = useMutation(
    `https://testnet-operator-evm.orderly.org/v1/faucet/usdc`
  );
  const config = useConfig<ConfigStore>();
  const onGetClick = useCallback(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      return modal.show(WalletConnectSheet, {
        status: state.status,
      });
    }
    setDisableGetTestUSDC(true);
    return getTestUSDC({
      chain_id: account.wallet?.chainId.toString(),
      user_address: state.address,
      broker_id: config.get("brokerId"),
    }).then(
      (res: any) => {
        setDisableGetTestUSDC(false);
        if (res.success) {
          return modal.confirm({
            title: "Get test USDC",
            content:
              "1,000 USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",
            onOk: () => {
              return Promise.resolve();
            },
          });
        }
        res.message && toast.error(res.message);
        // return Promise.reject(res);
      },
      (error: Error) => {
        toast.error(error.message);
      }
    );
  }, [state]);

  const [{ aggregated }, positionsInfo] = usePositionStream();
  const { marginRatio } = useMarginRatio();

  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? positionsInfo["margin_ratio"](10)
        : marginRatio
    );
  }, [marginRatio, aggregated]);

  return (
    <Collapsible
      open={collapsed > 0}
      onOpenChange={(value) => {
        setCollapsed(value ? 1 : 0);
      }}
    >
      <div
        className={
          "orderly-py-4 orderly-flex orderly-justify-between orderly-items-center orderly-tabular-nums"
        }
      >
        <div className={"orderly-flex-1"}>
          <div className={"orderly-text-3xs orderly-text-base-contrast-54"}>
            Total balance
          </div>
          <div>
            <Numeral
              surfix={
                <span
                  className={
                    "orderly-text-base-contrast-36 orderly-font-semibold"
                  }
                >
                  USDC
                </span>
              }
              className="desktop:orderly-font-semibold"
            >
              {availableBalance}
            </Numeral>
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <button className="orderly-p-1 orderly-rounded hover:orderly-bg-base-900 data-[state=open]:orderly-rotate-180 orderly-transition-transform">
            {/* @ts-ignore */}

            <ChevronDown
              size={18}
              className={"orderly-text-base-contrast-54 orderly-z-0"}
            />
          </button>
        </CollapsibleTrigger>
      </div>
      {showGetTestUSDC && (
        <div className="orderly-w-full orderly-pb-4">
          <Button
            variant={"outlined"}
            fullWidth
            size={"small"}
            className="orderly-border-base-contrast-54 hover:orderly-bg-base-700 orderly-h-[28px] orderly-rounded-borderRadius-lg"
            onClick={onGetClick}
            disabled={disableGetTestUSDC}
          >
            <NetworkImage type={"token"} name={"USDC"} size={16} rounded />
            <span className="orderly-text-base-contrast orderly-text-3xs">
              Get 1,000 test USDC
            </span>
          </Button>
        </div>
      )}
      <Divider className="orderly-pb-4" />

      <CollapsibleContent>
        <MemorizedAssetsDetail />
      </CollapsibleContent>

      <div className={"orderly-pb-4"}>
        <Progress
          value={marginRatioVal * 100}
          variant={"gradient"}
          foregroundClassName={cn(
            "",
            marginRatioVal <= 0.1 &&
              "orderly-bg-gradient-to-r orderly-from-[rgba(244,128,124,1)] orderly-to-[rgba(255,79,130,1)]",
            marginRatioVal >= 1 &&
              "orderly-bg-gradient-to-r orderly-from-[rgba(29,246,181,1)] orderly-to-[rgba(134,237,146,1)]",
            marginRatio > 0.1 &&
              marginRatio < 1 &&
              "orderly-bg-gradient-to-r orderly-from-[rgba(230,214,115,1)] orderly-to-[rgba(230,200,115,1)]"
          )}
        />
      </div>
      <MemorizedLeverage />
    </Collapsible>
  );
};
