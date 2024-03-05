import { FC, useCallback, useContext, useMemo, useState } from "react";
import { ChainListView } from "@/block/pickers/chainPicker";
import Button from "@/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/dialog";
import {
  ARBITRUM_MAINNET_CHAINID_HEX,
  ARBITRUM_TESTNET_CHAINID_HEX,
  type API,
} from "@orderly.network/types";
import {
  useChains,
  OrderlyContext,
  useWalletConnector,
  useMediaQuery,
} from "@orderly.network/hooks";
import { ArrowIcon, NetworkImage } from "@/icon";
import { OrderlyAppContext } from "@/provider";
import { cn } from "@/utils/css";

import { ChainCell } from "@/block/pickers/chainPicker/chainCell";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/dropdown/dropdown";
import { DropdownMenuPortal } from "@radix-ui/react-dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { isTestnet } from "@orderly.network/utils";

interface ChainsProps {
  disabled?: boolean;
  className?: string;
}

export const Chains: FC<ChainsProps> = (props) => {
  const { disabled } = props;

  const [open, setOpen] = useState(false);
  const { networkId } = useContext<any>(OrderlyContext);
  const { onChainChanged } = useContext(OrderlyAppContext);
  const [defaultChain, setDefaultChain] = useState<string>(
    networkId === "mainnet"
      ? ARBITRUM_MAINNET_CHAINID_HEX
      : ARBITRUM_TESTNET_CHAINID_HEX
  );

  const [testChains] = useChains("testnet", {
    pick: "network_infos",
    filter: (item: API.Chain) => isTestnet(item.network_infos?.chain_id),
  });

  const [mainChains, { findByChainId }] = useChains("mainnet", {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const { connectedChain, setChain, settingChain } = useWalletConnector();

  const resetDefaultChain = useCallback(() => {
    if (
      networkId === "mainnet" &&
      defaultChain !== ARBITRUM_MAINNET_CHAINID_HEX
    ) {
      setDefaultChain(ARBITRUM_MAINNET_CHAINID_HEX);
    } else if (
      networkId === "testnet" &&
      defaultChain !== ARBITRUM_TESTNET_CHAINID_HEX
    ) {
      setDefaultChain(ARBITRUM_TESTNET_CHAINID_HEX);
    }
  }, [defaultChain]);

  const chainName = useMemo(() => {
    const chain = findByChainId(
      // @ts-ignore
      parseInt(connectedChain?.id || defaultChain),
      "network_infos"
    );

    if (!chain) return <span>Unknown</span>;

    // @ts-ignore
    if (isTestnet(chain.chain_id)) {
      return <span>Testnet</span>;
    }

    // @ts-ignore
    return <NetworkImage id={chain.chain_id} type="chain" size={16} />;
  }, [connectedChain, findByChainId, defaultChain]);

  const switchDomain = (chainId: number) => {
    // const domain = configStore.get("domain");
    // const url = isTestnet(chainId) ? domain?.testnet : domain?.mainnet;
    // window.location.href = url;
    // window.open(url); // test in storybook
    // console.log("onChainChanged", chainId, isTestnet(chainId), onChainChanged);
    if (onChainChanged) {
      onChainChanged(chainId, isTestnet(chainId));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div className="orderly-h-[48px] orderly-flex orderly-items-center">
          <Button
            variant={"outlined"}
            size={"small"}
            color={"buy"}
            loading={settingChain}
            disabled={disabled}
            className={cn(
              "orderly-border-primary orderly-gap-1 orderly-text-base-contrast orderly-h-[30px] hover:orderly-text-primary-light hover:orderly-bg-transparent active:orderly-bg-transparent",
              props.className
            )}
            onClick={() => {
              setOpen((value) => !value);
            }}
          >
            {chainName}
            <ArrowIcon size={8} className="orderly-text-base-contrast-54" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="end"
        sideOffset={-1}
        className="orderly-max-h-[360px] orderly-max-w-[260px] orderly-overflow-y-auto orderly-bg-base-800 orderly-hide-scrollbar orderly-rounded-borderRadius orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)]"
      >
        <ChainListView
          // @ts-ignore
          mainChains={mainChains}
          // @ts-ignore
          testChains={testChains}
          // @ts-ignore
          onItemClick={(item: any) => {
            setOpen(false);

            if (connectedChain) {
              setChain({ chainId: item.id }).then((success: boolean) => {
                // reset default chain when switch to connected chain
                resetDefaultChain();
                if (success) {
                  switchDomain(item.id);
                }
              });
            } else {
              setDefaultChain(item.id);
              switchDomain(item.id);
            }
          }}
          // @ts-ignore
          currentChainId={parseInt(connectedChain?.id || defaultChain)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
