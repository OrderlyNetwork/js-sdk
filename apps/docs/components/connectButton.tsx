import { useAccount, useWalletConnector } from "@orderly.network/hooks";

import { useEffect } from "react";

export const ConnectButton = () => {
  const wallet = useWalletConnector();
  // const { account } = useAccount();

  return (
    <button
      className="bg-gray-700 p-2 text-white rounded hover:bg-gray-800 h-[35px] flex items-center"
      onClick={() => {
        wallet.connect().then((res) => {});
      }}
    >
      Connect
    </button>
  );
};
