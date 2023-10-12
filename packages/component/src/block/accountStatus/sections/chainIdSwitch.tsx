import { FC, useCallback, useContext, useState } from "react";
import { ChainListView, ChainPicker } from "@/block/pickers/chainPicker";
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
  const { networkId } = useContext<any>(OrderlyContext);

  const [testChains] = useChains(networkId, {
    pick: "network_infos",
    filter: (item: API.Chain) => item.network_infos.chain_id === 421613,
  });

  console.log("testChains", testChains);

  const onChainChange = useCallback(
    ({ id, name }: { id: number; name: string }) => {
      props
        .onSetChain(id)
        .then(
          (isSuccess) => {
            if (isSuccess) {
              toast.success("Success");
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
    <div className="bg-[#5A480C] fixed left-0 right-0 bottom-[64px] h-[40px] flex items-center px-[12px] text-[#E5C700] z-10 text-sm gap-2">
      <span>Please connect to a supported network.</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <button className="text-primary">Switch network</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Swith network</DialogHeader>
          <DialogBody>
            <ChainListView
              mainChains={[]}
              testChains={testChains}
              onItemClick={onChainChange}
            />
            {/* <ChainPicker
              mainnetChains={[]}
              testChains={testChains}
              onChange={onChainChange}
            /> */}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};
