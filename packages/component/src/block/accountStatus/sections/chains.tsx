import { ChainListView } from "@/block/pickers/chainPicker";
import Button from "@/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/dialog";
import { type API } from "@orderly.network/types";
import { ChevronDown } from "lucide-react";
import { useChains, OrderlyContext, useBoolean } from "@orderly.network/hooks";
import { FC, useContext, useMemo, useState } from "react";
import { ArrowIcon, NetworkImage } from "@/icon";
import { WalletConnectorContext } from "@/provider";

interface ChainsProps {
  //   mainnetChains: API.NetworkInfos[];
  //   testChains: API.NetworkInfos[];
}

export const Chains: FC<ChainsProps> = (props) => {
  //   const { mainnetChains, testChains } = props;

  const [open, setOpen] = useState(false);
  const { networkId, onlyTestnet } = useContext<any>(OrderlyContext);

  // const [switching,{start,stop}] = useBoolean(false)

  const [testChains] = useChains("testnet", {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (item: API.Chain) => item.network_infos.chain_id === 421613,
  });

  const [mainChains, { findByChainId }] = useChains("mainnet", {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const { connectedChain, setChain, settingChain } = useContext(
    WalletConnectorContext
  );

  const chainName = useMemo(() => {
    const chain = findByChainId(
      parseInt(connectedChain?.id || ""),
      "network_infos"
    );

    if (!chain) return <span>Unknown</span>;

    if (chain.chain_id === 421613) {
      return <span>Testnet</span>;
    }

    return <NetworkImage id={chain.chain_id} type="chain" />;

    console.log("\\\\\\", chain);
  }, [connectedChain]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant={"outlined"}
          size={"small"}
          color={"buy"}
          loading={settingChain}
          className={
            "border-[rgba(38,254,254,1)] gap-1 text-base-contrast h-[30px]"
          }
        >
          {/* <NetworkImage id={1} type="chain" size={"small"} /> */}

          {chainName}
          {/* <ChevronDown size={16} className="rotate-180" /> */}
          <ArrowIcon size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Swith network</DialogHeader>
        <DialogBody>
          <ChainListView
            mainChains={onlyTestnet ? [] : mainChains}
            testChains={testChains}
            onItemClick={(item: any) => {
              // console.log(item);
              setOpen(false);
              setChain({ chainId: item.id }).then((success: boolean) => {
                console.log("========>>>>>>>", success);
              });
            }}
            currentChainId={parseInt(connectedChain?.id || "")}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
