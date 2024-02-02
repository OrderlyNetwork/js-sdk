import { FC, ReactNode } from "react";
import { API } from "@orderly.network/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { DesktopTokenCell } from "./tokenCell.desktop";

interface TokenSelectProps {
  tokens: API.TokenInfo[];
  onTokenChange?: (token: API.TokenInfo) => void;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export const DesktopTokenSelect: FC<TokenSelectProps> = (props) => {
  return (
    <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger disabled={props.disabled} asChild>
        {props.trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="orderly-token-select-dropdown-menu orderly-rounded-sm orderly-bg-base-700 orderly-min-w-[120px] orderly-max-h-[280px] orderly-overflow-y-auto orderly-overflow-hidden orderly-mt-2 orderly-py-2 orderly-shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)] orderly-z-[100]"
      >
        {props.tokens?.map((token) => {
          return (
            <DropdownMenuItem
              key={token.symbol}
              onClick={() => {
                props.onTokenChange?.(token);
                props.onOpenChange(false);
              }}
            >
              <DesktopTokenCell
                token={token}
                fetchBalance={props.fetchBalance}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
