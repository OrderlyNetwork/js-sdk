import { FC, useCallback, useContext, useState } from "react";
import { ChainListView } from "@/block/pickers/chainPicker";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/dialog";

import { useChains, OrderlyContext } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { toast } from "@/toast";

export interface Props {
  onSetChain: (chainId: number) => Promise<any>;
}

export const ChainIdSwtich: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const { networkId, onlyTestnet } = useContext<any>(OrderlyContext);

  const [testChains] = useChains("testnet", {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (item: API.Chain) => item.network_infos?.chain_id === 421613,
  });

  const [mainChains] = useChains("mainnet", {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const onChainChange = useCallback(
    ({ id, name }: { id: number; name: string }) => {
      props
        .onSetChain(id)
        .then(
          (isSuccess) => {
            if (isSuccess) {
              toast.success("Network switched");
            } else {
              toast.error("Cancel");
            }
          },
          (error) => {
            toast.error(error.message);
          }
        )
        .finally(() => setOpen(false));
    },
    []
  );

  return (
    <div className="orderly-bg-[#5A480C] orderly-fixed orderly-left-0 orderly-right-0 orderly-bottom-[64px] orderly-h-[40px] orderly-flex orderly-items-center orderly-px-[12px] orderly-text-[#E5C700] orderly-z-10 orderly-text-3xs orderly-gap-2">
      <span>Please connect to a supported network.</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <button className="orderly-text-primary-light orderly-text-xs">Switch network</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="orderly-text-xs">Switch network</DialogHeader>
          <DialogBody className="orderly-max-h-[327.5px] orderly-overflow-y-auto orderly-text-3xs">
            <ChainListView
              // @ts-ignore
              mainChains={onlyTestnet ? [] : mainChains}
              // @ts-ignore
              testChains={testChains}
              onItemClick={onChainChange}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};
