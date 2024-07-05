import { useAccount } from "@orderly.network/hooks";

export const useWalletConnectorBuilder = () => {
  const { account, state, createOrderlyKey, createAccount } = useAccount();

  return {
    enableTrading: createOrderlyKey,
    initAccountState: state.status,
    signIn: createAccount,
  } as const;
};
