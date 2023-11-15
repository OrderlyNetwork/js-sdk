import {
  Children,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useChains } from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { ArrowLeftRight } from "lucide-react";
import { ChainConfig, CurrentChain } from "@orderly.network/types";
import { modal } from "@/modal";
import { ChainDialog } from "./chainDialog";
import { API } from "@orderly.network/types";
import { Spinner } from "@/spinner";

export interface ChainSelectProps {
  disabled?: boolean;
  onValueChange?: (value: any) => void;
  onChainInited?: (chain: API.Chain) => void;
  // onChainIdChange?: (chainId: number) => void;
  value: CurrentChain | null;
  settingChain?: boolean;
  onlyTestnet?: boolean;
  wooSwapEnabled?: boolean;
  filter?: (chain: API.Chain) => boolean;
}

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const { onlyTestnet, wooSwapEnabled = true, disabled } = props;

  const [allChains, { findByChainId }] = useChains("", {
    wooSwapEnabled,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => chain.network_infos?.chain_id === 421613,
  });

  const chains = useMemo(() => {
    if (Array.isArray(allChains)) return allChains;

    if (onlyTestnet) {
      return allChains.testnet ?? [];
    }
    return allChains.mainnet;
  }, [allChains, onlyTestnet]);

  const { value } = props;

  const currentChain = useMemo(() => {
    if (!value || !chains || !Array.isArray(chains)) return undefined;
    // 如果value是不支持的chain, 显示unknown

    if (
      chains.findIndex(
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

    const chainInfo = findByChainId(result?.id);

    props?.onValueChange?.(chainInfo);
  }, [chains, props.onValueChange, value?.id]);

  useEffect(() => {
    // 获取 到chain列表之后，初始化chain及其token列表
    if (!!chains) {
      const chainInfo = findByChainId(value?.id);
      if (!chainInfo) return;
      props.onChainInited?.(chainInfo);
    }
  }, [props.value?.id, chains?.length]);

  const icon = useMemo(() => {
    if (props.settingChain) {
      return <Spinner size={"small"} className="text-primary-light" />;
    }
    if (chains?.length > 1) {
      return <ArrowLeftRight size={16} className="text-primary-light" />;
    }
    return null;
  }, [chains?.length, props.settingChain]);

  return (
    <button
      className="flex w-full items-center px-2 rounded bg-base-500"
      disabled={(chains?.length ?? 0) < 2 || props.settingChain}
      onClick={onClick}
    >
      <NetworkImage
        id={currentChain?.chain_id}
        type={currentChain ? "chain" : "unknown"}
        size={"small"}
        rounded
      />
      <span className="flex-1 px-2 text-3xs text-left">
        {currentChain?.name ?? "Unknown"}
      </span>
      {icon}
    </button>
  );
};
