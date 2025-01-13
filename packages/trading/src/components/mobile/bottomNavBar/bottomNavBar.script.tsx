import { useAccount, useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

export const useBottomNavBarScript = () => {
  const { wrongNetwork } = useAppContext();
  const { account, state } = useAccount();
  const [selectedChainId, seSelectedChainId] = useLocalStorage<string>(
    "orderly_selected_chainId",
    ""
  );

  const onDisconnect = async () => {
    await account.disconnect();
    selectedChainId && seSelectedChainId("");
  };

  return {
    wrongNetwork,
    status: state.status,
    onDisconnect,
  };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;
