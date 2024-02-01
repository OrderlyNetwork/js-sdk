import {
  Children,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useChains,
  useWalletConnector,
  useMediaQuery,
} from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { ArrowLeftRight } from "lucide-react";
import { ChainConfig, CurrentChain } from "@orderly.network/types";
import { modal } from "@/modal";
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
import { isTestnet } from "@orderly.network/utils";

export interface ChainSelectProps {
  disabled?: boolean;
  onValueChange?: (value: any) => void;
  onChainInited?: (chain: API.Chain) => void;
  // onChainIdChange?: (chainId: number) => void;
  value: CurrentChain | null;
  settingChain?: boolean;
  wooSwapEnabled?: boolean;
  filter?: (chain: API.Chain) => boolean;
}

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const [open, setOpen] = useState(false);

  const isTable = useMediaQuery(MEDIA_TABLET);
  const { wooSwapEnabled = true, disabled } = props;
  // @ts-ignore
  const [allChains, { findByChainId }] = useChains("", {
    wooSwapEnabled,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => isTestnet(chain.network_infos?.chain_id),
  });

  const { connectedChain } = useWalletConnector();

  const chains = useMemo(() => {
    if (Array.isArray(allChains)) return allChains;
    if (allChains === undefined) return [];

    if (connectedChain && isTestnet(connectedChain.id)) {
      return allChains.testnet ?? [];
    }

    return allChains.mainnet;
  }, [allChains, connectedChain]);

  const { value } = props;

  const currentChain = useMemo(() => {
    if (!value || !chains || !Array.isArray(chains)) return undefined;
    // 如果value是不支持的chain, 显示unknown

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

  const onClick = useCallback(async () => {
    const result = await modal.show<{ id: number }, any>(ChainDialog, {
      // testChains: onlyTestnet ? chains.testnet : [],
      mainChains: chains,
      currentChainId: value?.id,
    });
    if (result?.id) {
      const chainInfo = findByChainId(result.id);
      props?.onValueChange?.(chainInfo);
    }
  }, [chains, props.onValueChange, value?.id]);

  useEffect(() => {
    // 获取 到chain列表之后，初始化chain及其token列表
    if (!!chains) {
      const chainInfo = findByChainId(value?.id!);
      if (!chainInfo) return;
      props.onChainInited?.(chainInfo as any);
    }
  }, [props.value?.id, chains?.length]);

  const icon = useMemo(() => {
    if (props.settingChain) {
      return <Spinner size={"small"} className="orderly-text-primary-light" />;
    }
    if (chains?.length > 1) {
      return (
        // @ts-ignore
        <ArrowLeftRight size={16} className="orderly-text-primary-light" />
      );
    }
    return null;
  }, [chains?.length, props.settingChain]);

  if (isTable) {
    return (
      <MobileChainSelect
        chains={chains}
        settingChain={props.settingChain}
        onClick={onClick}
        currentChain={currentChain}
        icon={icon}
      />
    );
  }

  return (
    <DesktopChainSelect
      chains={chains}
      settingChain={props.settingChain}
      currentChain={currentChain}
      icon={icon}
      findByChainId={findByChainId}
      onValueChange={props.onValueChange}
      connectedChain={connectedChain}
    />
  );
};

const MobileChainSelect: FC<{
  chains: any;
  settingChain: any;
  onClick: any;
  currentChain: any;
  icon: any;
}> = (props) => {
  const { chains, onClick, currentChain, icon } = props;
  return (
    <button
      className="orderly-flex orderly-w-full orderly-items-center orderly-px-2 orderly-rounded orderly-bg-base-500"
      disabled={(chains?.length ?? 0) < 2 || props.settingChain}
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
  settingChain: any;
  currentChain: any;
  icon: any;
  findByChainId: any;
  onValueChange: any;
  connectedChain: any;
}> = (props) => {
  const { chains, currentChain, icon, findByChainId, connectedChain } = props;
  const [open, setOpen] = useState(false);
  // const canOpen = !((chains?.length ?? 0) < 2 || props.settingChain);

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

  if ((chains?.length ?? 0) < 2 || props.settingChain) {
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
                const chainInfo = findByChainId(chain.chain_id);
                if (chainInfo) {
                  props?.onValueChange?.(chainInfo);
                }
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
