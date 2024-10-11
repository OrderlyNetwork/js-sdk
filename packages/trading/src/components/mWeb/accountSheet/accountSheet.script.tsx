import { useAccount } from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";

export const useAccountSheetScript = () => {
  const { account } = useAccount();
  const accountId = account.accountId;
  const address = account.address;
  const chainId = account.chainId;
  const affiliate = 2000.22;
  const isTrader = true;
  const isAffliate = true;
  const trader = 2000.23;

  const onCopyAddress = () => {
    navigator.clipboard.writeText(address ?? "");
    toast.success("Copy success");
  };

  const onGotoAffliate = () => {};

  const curEpochId = 1;
  const onGotoTradingRewards = () => {};
  const estRewards = 21111.22;

  const onDisconnect = () => {};
  return {
    accountId,
    address,
    chainId,
    onCopyAddress,

    affiliate,
    onGotoAffliate,
    isAffliate,
    isTrader,
    trader,

    curEpochId,
    onGotoTradingRewards,
    estRewards,


    onDisconnect,
  };
};

export type AccountSheetState = ReturnType<typeof useAccountSheetScript>;
