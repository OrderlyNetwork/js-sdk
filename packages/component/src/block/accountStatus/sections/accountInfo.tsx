import { Avatar, Blockie } from "@/avatar";
import Button, { IconButton } from "@/button";
import { Share, Copy } from "lucide-react";
import React, { FC, useCallback } from "react";
import { Text } from "@/text";
import { useAccount } from "@orderly.network/hooks";
import { toast } from "@/toast";

export interface AccountInfoProps {
  onDisconnect?: () => void;
  accountId?: string;
}

export const AccountInfo: FC<AccountInfoProps> = (props) => {
  const { onDisconnect } = props;
  const { account, state } = useAccount();

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(state.address).then(() => {
      toast.success("Copied to clipboard");
    });
  }, [state]);

  return (
    <div>
      <div className="flex py-6">
        <div className="flex-1 flex items-center gap-2">
          <Blockie address={state.address} />
          <div className="flex flex-col">
            <Text rule={"address"}>{account.accountId}</Text>
            <div className="text-xs">Testnet</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton type="button" onClick={onCopy}>
            <Copy size={20} stroke="currentcolor" />
          </IconButton>
          <IconButton>
            <Share size={20} />
          </IconButton>
        </div>
      </div>
      <div className="py-4 grid grid-cols-2 gap-3">
        <Button variant={"outlined"}>Get test USDC</Button>
        <Button
          variant={"outlined"}
          color={"sell"}
          onClick={() => {
            onDisconnect?.();
          }}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
};
