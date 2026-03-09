import { useMemo } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { ABSTRACT_CHAIN_ID_MAP } from "@orderly.network/types";

/**
 * Resolves the user's wallet address, handling Abstract Global Wallet (AGW)
 * chains which use a separate AGWAddress rather than the connected EOA address.
 */
export function useWalletAddress(): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any;
  address: string | undefined;
} {
  const { wallet, connectedChain } = useWalletConnector();
  const { state: accountState, account } = useAccount();

  const address = useMemo(() => {
    let addr = accountState.address;
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain.id as string))
    ) {
      addr = account.getAdditionalInfo()?.AGWAddress;
    }
    return addr;
  }, [accountState, account, connectedChain]);

  return { wallet, address };
}
