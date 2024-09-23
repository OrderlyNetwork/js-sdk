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
import { MemorizedLeverage } from "@/block/accountStatus/full/leverage";
import { MemorizedAssetsDetail } from "@/block/accountStatus/full/assetsDetail";
import Button from "@/button";
import { NetworkImage } from "@/icon";
import { AccountStatusEnum } from "@orderly.network/types";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@orderly.network/ui";
import { isTestnet } from "@orderly.network/utils";

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
  const config = useConfig();

  const { account, state } = useAccount();
  const showGetTestUSDC = useMemo(() => {
    const chainId = connectedChain?.id;
    if (chainId === undefined) {
      return false;
    }

    return (
      state.status === AccountStatusEnum.EnableTrading &&
      // @ts-ignore
      isTestnet(parseInt(chainId))
    );
  }, [state.status, connectedChain]);

  const [getTestUSDC, { isMutating }] = useMutation(
    `${config.get("operatorUrl")}/v1/faucet/usdc`
  );
  const onGetClick = useCallback(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      return modal.show(WalletConnectSheet, {
        status: state.status,
      });
    }
    setDisableGetTestUSDC(true);
    return getTestUSDC({
      chain_id: account.walletAdapter?.chainId.toString(),
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
        ? // @ts-ignore
          positionsInfo["margin_ratio"](10)
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
          "orderly-py-3 orderly-flex orderly-justify-between orderly-items-center orderly-tabular-nums"
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
                    "orderly-text-base-contrast-36 orderly-font-medium"
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
        <div className="orderly-mb-3 orderly-w-full">
          <Button
            id="orderly-desktop-get-test-usdc"
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

      <CollapsibleContent>
        <MemorizedAssetsDetail />
      </CollapsibleContent>

      <div className={"orderly-pb-4"}>
        <Progress value={marginRatioVal * 10} variant={"gradient"} />
      </div>
      <MemorizedLeverage />
    </Collapsible>
  );
};
