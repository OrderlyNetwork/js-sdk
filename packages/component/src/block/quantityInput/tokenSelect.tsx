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
import { FC, useMemo, useState } from "react";
import { TokenListView } from "../pickers/tokenPicker";

interface TokenSelectProps {
  disabled?: boolean;
  tokens: API.TokenInfo[];
  token?: API.TokenInfo;
  onTokenChange?: (token: API.TokenInfo) => void;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
  onClosed?: () => void;
}

export const TokenSelect: FC<TokenSelectProps> = (props) => {
  const { tokens, disabled } = props;
  const [open, setOpen] = useState<boolean>(false);

  const token = useMemo(() => {
    if (!!props.token) {
      return props.token;
    }

    // default show USDC when no token selected
    return {
      symbol: "USDC",
    };
  }, [props.token]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={(tokens?.length ?? 0) < 2 || disabled}
          className={
            "orderly-flex orderly-items-center orderly-gap-1 orderly-text-3xs orderly-text-base-contrast-80 orderly-mr-2 desktop:orderly-text-xs"
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

      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          props.onClosed?.();
        }}
      >
        <DialogHeader className="after:orderly-hidden">Select token</DialogHeader>
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
