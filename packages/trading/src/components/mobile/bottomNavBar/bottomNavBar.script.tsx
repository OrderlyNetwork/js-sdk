import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

export const useBottomNavBarScript = () => {
  const { wrongNetwork } = useAppContext();
  const { account, state } = useAccount();

  const onDisconnect = async () => {
    await account.disconnect();
  };

  return {
    wrongNetwork,
    status: state.status,
    onDisconnect,
  };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;
