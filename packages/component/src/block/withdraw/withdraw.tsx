import { useContext, useMemo } from "react";
import { WithdrawForm } from "./withdrawForm";
import {
  useChain,
  useWithdraw,
  useAccountInstance,
} from "@orderly.network/hooks";
import { WalletConnectorContext } from "@/provider";
import { AssetsProvider } from "@/provider/assetsProvider";

export const Withdraw = () => {
  //   const { state } = useAccount();
  const { connectedChain, wallet, setChain } = useContext(
    WalletConnectorContext
  );

  const { chains } = useChain("USDC");

  const { maxAmount, availableBalance, unsettledPnL } = useWithdraw();

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;
    return {
      ...connectedChain,
      id: parseInt(connectedChain?.id),
    };
  }, [connectedChain]);

  const account = useAccountInstance();

  return (
    <AssetsProvider>
      <WithdrawForm
        address={wallet?.accounts?.[0].address}
        chain={currentChain}
        chains={chains?.chain_details}
        walletName={wallet?.label}
        switchChain={setChain}
        decimals={chains?.decimals ?? 2}
        minAmount={chains?.minimum_withdraw_amount ?? 1}
        maxAmount={maxAmount}
        availableBalance={availableBalance}
        unsettledPnL={unsettledPnL}
        onWithdraw={function (inputs: {
          chainId: number;
          token: string;
          amount: number;
        }): Promise<any> {
          return account.assetsManager.withdraw(inputs);
        }}
      />
    </AssetsProvider>
  );
};
