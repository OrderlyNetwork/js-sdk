import { ChainPicker } from "@/block/pickers/chainPicker";
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
import { useChains } from "@orderly.network/hooks";
import { FC, useState } from "react";
import { ArrowIcon } from "@/icon";

interface ChainsProps {
  //   mainnetChains: API.NetworkInfos[];
  //   testChains: API.NetworkInfos[];
}

export const Chains: FC<ChainsProps> = (props) => {
  //   const { mainnetChains, testChains } = props;

  const [open, setOpen] = useState(false);

  const [testChains] = useChains("testnet", {
    pick: "network_infos",
    filter: (item: API.Chain) => item.network_infos.chain_id === 421613,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant={"outlined"}
          size={"small"}
          color={"buy"}
          className={"border-[rgba(38,254,254,1)] gap-1 text-base-contrast"}
        >
          {/* <NetworkImage id={1} type="chain" size={"small"} /> */}
          <span>Testnet</span>
          {/* <ChevronDown size={16} className="rotate-180" /> */}
          <ArrowIcon size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Swith network</DialogHeader>
        <DialogBody>
          <ChainPicker
            mainnetChains={[]}
            testChains={testChains}
            onChange={() => setOpen(false)}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
