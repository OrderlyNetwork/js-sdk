import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  useChains,
  useWalletConnector,
  useMediaQuery,
  useConfig,
} from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { ArrowLeftRight } from "lucide-react";
import type { CurrentChain } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { ChainDialog } from "./chainDialog";
import { API } from "@orderly.network/types";
import { Spinner } from "@/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChainCell } from "./chainCell";
import { MEDIA_TABLET } from "@orderly.network/types";
import { Chain, Chains } from "@orderly.network/hooks";
import type { NetworkId } from "@orderly.network/types";

export interface ChainSelectProps {
  disabled?: boolean;
  onValueChange?: (value: any) => void;
  onChainInited?: (chain: API.Chain) => void;
  // onChainIdChange?: (chainId: number) => void;
  value: CurrentChain | null;
  settingChain?: boolean;
  filter?: (chain: API.Chain) => boolean;
  chains?: Chains<undefined, undefined>;
}

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const isTable = useMediaQuery(MEDIA_TABLET);
  const networkId = useConfig<NetworkId>("networkId");
  const [allChains, { findByChainId }] = useChains(undefined, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => isTestnet(chain.network_infos?.chain_id),
  });

  const { connectedChain } = useWalletConnector();

  const chains = useMemo(() => {
    let targetChains = allChains;
    if (props.chains) {
      targetChains.mainnet = props.chains.mainnet?.map(
        (item) => item.network_infos
      );
      targetChains.testnet = props.chains.testnet?.map(
        (item) => item.network_infos
      );
    }

    if (Array.isArray(targetChains)) return targetChains;
    if (targetChains === undefined) return [];

    return targetChains[networkId];
  }, [allChains, props.chains, networkId]);

  const { value } = props;

  const currentChain = useMemo(() => {
    if (!value || !chains || !Array.isArray(chains)) return undefined;

    if (
      chains.findIndex(
        // @ts-ignore
        (chain: API.NetworkInfos) => chain.chain_id === value.id
      ) < 0
    ) {
      return undefined;
    }
    return value.info?.network_infos;
  }, [value, chains]);

  const onChainChange = (chainId: number) => {
    if (!chainId) return;
    let chainInfo: Chain | undefined;
    if (props.chains) {
      chainInfo = [...props.chains?.mainnet, ...props.chains?.testnet].find(
        // @ts-ignore
        (item) => parseInt(item.network_infos?.chain_id) === parseInt(chainId)
      );
    } else {
      chainInfo = findByChainId(chainId);
    }
    chainInfo && props?.onValueChange?.(chainInfo);
  };

  const onClick = useCallback(async () => {
    const result = await modal.show<{ id: number }, any>(ChainDialog, {
      mainChains: chains,
      currentChainId: value?.id,
    });
    onChainChange(result?.id);
  }, [chains, value?.id, props.onValueChange, findByChainId, props.chains]);

  const onDropMenuItemClick = useCallback(
    (chain: any) => {
      onChainChange(chain.chain_id);
    },
    [props?.onValueChange, findByChainId, props.chains]
  );

  useEffect(() => {
    if (!!chains || !!props.chains) {
      let chainInfo: Chain | undefined;

      if (props.chains) {
        chainInfo = [...props.chains?.mainnet, ...props.chains?.testnet].find(
          // @ts-ignore
          (item) =>
            // @ts-ignore
            parseInt(item.network_infos?.chain_id) ===
            // @ts-ignore
            parseInt(props.value?.id!)
        );
      } else {
        chainInfo = findByChainId(props.value?.id!);
      }
      if (!chainInfo) return;
      props.onChainInited?.(chainInfo as any);
    }
  }, [props.value?.id, chains?.length, props.chains]);

  // if chains is unknown, always can select chains
  const selectable =
    (!currentChain || chains?.length > 1) && !props.settingChain;

  const icon = useMemo(() => {
    if (props.settingChain) {
      return <Spinner size={"small"} className="orderly-text-primary-light" />;
    }

    // if chains is unknown, always show icon
    if (!currentChain || chains?.length > 1) {
      return (
        // @ts-ignore
        <ArrowLeftRight size={16} className="orderly-text-primary-light" />
      );
    }
    return null;
  }, [chains?.length, props.settingChain, currentChain]);

  if (isTable) {
    return (
      <MobileChainSelect
        chains={chains}
        onClick={onClick}
        currentChain={currentChain}
        icon={icon}
        selectable={selectable}
      />
    );
  }

  return (
    <DesktopChainSelect
      chains={chains}
      currentChain={currentChain}
      icon={icon}
      connectedChain={connectedChain}
      onDropMenuItemClick={onDropMenuItemClick}
      selectable={selectable}
    />
  );
};

const MobileChainSelect: FC<{
  chains: any;
  onClick: any;
  currentChain: any;
  icon: any;
  selectable: boolean;
}> = (props) => {
  const { onClick, currentChain, icon } = props;
  return (
    <button
      className="orderly-flex orderly-w-full orderly-items-center orderly-px-2 orderly-rounded orderly-bg-base-500"
      disabled={!props.selectable}
      onClick={onClick}
    >
      <NetworkImage
        id={currentChain?.chain_id}
        type={currentChain ? "chain" : "unknown"}
        size={"small"}
        rounded
      />
      <span className="orderly-flex-1 orderly-px-2 orderly-text-3xs orderly-text-left desktop:orderly-text-xs">
        {currentChain?.name ?? "Unknown"}
      </span>
      {icon}
    </button>
  );
};

const DesktopChainSelect: FC<{
  chains: any;
  currentChain: any;
  icon: any;
  connectedChain: any;
  onDropMenuItemClick: (chain: any) => void;
  selectable: boolean;
}> = (props) => {
  const { chains, currentChain, icon, connectedChain } = props;
  const [open, setOpen] = useState(false);

  function parseChainId(id?: string | number) {
    if (typeof id === "number") {
      return id;
    }

    if (typeof id === "string") {
      if (id.startsWith("0x")) {
        return parseInt(id, 16);
      }
      return parseInt(id, 10);
    }
  }

  const buttonElem = useMemo(() => {
    return (
      <>
        <NetworkImage
          id={currentChain?.chain_id}
          type={currentChain ? "chain" : "unknown"}
          size={"small"}
          rounded
        />
        <span className="orderly-flex-1 orderly-px-2 orderly-text-3xs orderly-text-left">
          {currentChain?.name ?? "Unknown"}
        </span>
        {icon}
      </>
    );
  }, [currentChain]);

  if (!props.selectable) {
    return (
      <div className="orderly-flex orderly-w-full orderly-items-center orderly-px-2 orderly-rounded orderly-bg-base-500">
        {buttonElem}
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="orderly-flex orderly-w-full orderly-items-center orderly-px-2 orderly-rounded orderly-bg-base-500">
          {buttonElem}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ width: "241px", zIndex: 100 }}
        className="orderly-rounded-sm orderly-bg-base-700 orderly-max-h-[250px] orderly-overflow-y-auto orderly-overflow-hidden orderly-hide-scrollbar orderly-mt-2 orderly-shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]"
      >
        {chains.map((chain: any, index: number) => {
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                props.onDropMenuItemClick?.(chain);
              }}
            >
              <ChainCell
                key={chain.chain_id}
                name={chain.name}
                id={chain.chain_id}
                bridgeless={chain.bridgeless}
                selected={parseChainId(connectedChain?.id) === chain.chain_id}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
