import { useAccount } from "@kodiak-finance/orderly-hooks";
import { useAppContext } from "@kodiak-finance/orderly-react-app";

export const useBottomNavBarScript = () => {
  const { wrongNetwork, disabledConnect } = useAppContext();
  const { account, state } = useAccount();

  /** link device, acally wallet not connect */
  const onDisconnect = async () => {
    localStorage.removeItem("orderly_link_device");
    await account.disconnect();
  };

  return {
    wrongNetwork,
    disabledConnect,
    status: state.status,
    onDisconnect,
  };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;
