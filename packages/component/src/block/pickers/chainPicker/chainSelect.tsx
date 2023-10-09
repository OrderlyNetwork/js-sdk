import { FC, useCallback } from "react";
import { useChains } from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { ArrowLeftRight } from "lucide-react";
import { ChainConfig, ChainInfo } from "@orderly.network/types";
import { modal } from "@/modal";
import { ChainDialog } from "./chainDialog";

export interface ChainSelectProps {
  onValueChange?: (value: any) => void;
  value?: ChainConfig;
}

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const [chains] = useChains();
  const { value } = props;

  const onClick = useCallback(() => {
    modal.show(ChainDialog, {});
  }, []);

  return (
    <button
      className="flex w-full items-center px-2 rounded bg-fill"
      disabled={(chains?.length ?? 0) < 2}
      onClick={onClick}
    >
      <NetworkImage
        id={value?.id}
        type={value ? "chain" : "placeholder"}
        size={"small"}
        rounded
      />
      <span className="flex-1 px-2 text-left">{value?.chainName ?? "--"}</span>
      {chains?.length && chains.length > 1 && (
        <ArrowLeftRight size={16} className="text-primary-light" />
      )}
    </button>
  );
};
