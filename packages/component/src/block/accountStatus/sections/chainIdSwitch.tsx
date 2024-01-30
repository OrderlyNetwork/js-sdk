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
import { useTranslation } from "@/i18n";
import { OrderlyAppContext } from "@/provider";
import Button from "@/button";
import { isTestnet } from "@orderly.network/utils";

export interface Props {
  onSetChain: (chainId: number) => Promise<any>;
}

export const ChainIdSwtich: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const { networkId, enableSwapDeposit } = useContext<any>(OrderlyContext);

  const { onChainChanged } = useContext(OrderlyAppContext);

  const [testChains] = useChains("testnet", {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
    filter: (item: API.Chain) => isTestnet(item.network_infos?.chain_id),
  });

  const [mainChains] = useChains("mainnet", {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const t = useTranslation();

  const onChainChange = useCallback(
    ({ id, name }: { id: number; name: string }) => {
      props
        .onSetChain(id)
        .then(
          (isSuccess) => {
            if (isSuccess) {
              toast.success(t("toast.networkSwitched"));
              if (onChainChanged) {
                onChainChanged(id, isTestnet(id));
              }
            } else {
              toast.error(t("common.cancel"));
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
    <div className="orderly-bg-warning-darken orderly-fixed orderly-left-0 orderly-right-0 orderly-bottom-[64px] orderly-h-[40px] orderly-flex orderly-items-center orderly-px-[12px] orderly-text-warning orderly-z-10 orderly-text-3xs orderly-gap-2 desktop:orderly-flex desktop:orderly-items-center desktop:orderly-justify-center desktop:orderly-static">
      <span>Please connect to a supported network.</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            variant={"outlined"}
            size={"small"}
            className="orderly-text-warning orderly-border-warning hover:orderly-text-warning orderly-text-xs"
          >
            Switch network
          </Button>
        </DialogTrigger>
        <DialogContent closable>
          <DialogHeader className="orderly-switch-network-dialog-title orderly-text-xs">
            Switch network
          </DialogHeader>
          <DialogBody className="orderly-max-h-[327.5px] orderly-overflow-y-auto orderly-text-3xs">
            <ChainListView
              // @ts-ignore
              mainChains={mainChains}
              // @ts-ignore
              testChains={testChains}
              // @ts-ignore
              onItemClick={onChainChange}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};
