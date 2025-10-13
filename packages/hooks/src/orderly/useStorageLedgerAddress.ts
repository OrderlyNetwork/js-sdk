import { LedgerWalletKey } from "@kodiak-finance/orderly-types";
import { useLocalStorage } from "../useLocalStorage";

export const useStorageLedgerAddress = () => {
  const [ledgerWallet, setLedgerWallet] = useLocalStorage<string[]>(LedgerWalletKey, [] as string[]);

  const setLedgerAddress = (address:string) =>  {
    if (!ledgerWallet.includes(address)) {
      const arr = [...ledgerWallet, address];
      setLedgerWallet(arr);
    }
  }

  return {
    setLedgerAddress,
    ledgerWallet,
  }
};
