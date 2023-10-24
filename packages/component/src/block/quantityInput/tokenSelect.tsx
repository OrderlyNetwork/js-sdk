import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
import { NetworkImage } from "@/icon";
import { API } from "@orderly.network/types";

import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";
import { TokenListView } from "../pickers/tokenPicker";

interface TokenSelectProps {
  disabled?: boolean;
  tokens: API.TokenInfo[];
  token?: API.TokenInfo;
  onTokenChange?: (token: API.TokenInfo) => void;
  fetchBalance: (token: string) => Promise<any>;
}

export const TokenSelect: FC<TokenSelectProps> = (props) => {
  const { tokens, token, disabled } = props;
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={(tokens?.length ?? 0) < 2 || disabled}
          className={
            "flex items-center gap-1 text-sm text-base-contrast/80 mr-2 disabled:opacity-50"
          }
        >
          <NetworkImage
            type={token ? "token" : "placeholder"}
            name={token?.symbol}
            size={"small"}
            rounded
          />
          <span>{token?.symbol}</span>
          {tokens && tokens.length > 1 && <ChevronDown size={16} />}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="after:hidden">Select token</DialogHeader>
        <DialogBody>
          <TokenListView
            tokens={props.tokens}
            fetchBalance={props.fetchBalance}
            onItemClick={(token) => {
              props.onTokenChange?.(token);
              setOpen(false);
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
