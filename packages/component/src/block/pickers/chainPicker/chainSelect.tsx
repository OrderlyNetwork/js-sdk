import {
  Children,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useChains, OrderlyContext } from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { ArrowLeftRight } from "lucide-react";
import { ChainConfig } from "@orderly.network/types";
import { modal } from "@/modal";
import { ChainDialog } from "./chainDialog";
import { API } from "@orderly.network/types";
import { Spinner } from "@/spinner";

export interface ChainSelectProps {
  onValueChange?: (value: any) => void;
  onChainInited?: (chain: API.Chain) => void;
  // onChainIdChange?: (chainId: number) => void;
  value?: ChainConfig;
  settingChain?: boolean;
}

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const { networkId } = useContext<any>(OrderlyContext);

  const [chains, { findByChainId }] = useChains(networkId, {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => chain.network_infos.chain_id === 421613,
  });

  const { value } = props;

  const currentChain = useMemo(() => {
    if (!value || !chains) return undefined;
    return findByChainId(value.id, "network_infos");
  }, [props.value, chains]);

  console.log({ currentChain });

  const onClick = useCallback(async () => {
    const result = await modal.show<{ id: number }, any>(ChainDialog, {
      // mainChains: chains?.mainnet,
      // testChains: chains?.testnet,
      // mainChains: chains,
      testChains: chains,
      currentChainId: currentChain?.chain_id,
    });

    const chainInfo = findByChainId(result?.id);

    props?.onValueChange?.(chainInfo);
  }, [chains, props.onValueChange, currentChain?.chain_id]);

  useEffect(() => {
    // 获取 到chain列表之后，初始化chain及其token列表
    if (!!chains) {
      const chainInfo = findByChainId(props.value?.id);
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
      className="flex w-full items-center px-2 rounded bg-fill"
      disabled={(chains?.length ?? 0) < 2 || props.settingChain}
      onClick={onClick}
    >
      <NetworkImage
        id={currentChain?.chain_id}
        type={currentChain ? "chain" : "placeholder"}
        size={"small"}
        rounded
      />
      <span className="flex-1 px-2 text-left">
        {currentChain?.name ?? "--"}
      </span>
      {icon}
    </button>
  );
};
