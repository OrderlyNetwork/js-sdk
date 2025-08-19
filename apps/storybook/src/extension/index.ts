import { useEffect } from "react";
import { installDepositExtension } from "./deposit";
import { installWithdrawExtension } from "./withdraw";

export function useInstallExtensions() {
  useEffect(() => {
    installDepositExtension();
    installWithdrawExtension();
  }, []);
}
