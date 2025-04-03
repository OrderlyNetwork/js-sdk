import { useEventEmitter } from "@orderly.network/hooks";
import { useEffect } from "react";
import { modal, toast } from "@orderly.network/ui";
import { LedgerWalletKey } from "@orderly.network/types";
import { useStorageLedgerAddress } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

export function useWalletConnectError() {
  const { t } = useTranslation();
  const ee = useEventEmitter();
  const { setLedgerAddress } = useStorageLedgerAddress();

  useEffect(() => {
    ee.on("wallet:connect-error", (data) => {
      toast.error(data.message);
    });
    ee.on(
      "wallet:sign-message-with-ledger-error",
      (data: { userAddress: string; message: string }) => {
        window.setTimeout(() => {
          modal
            .confirm({
              title: t("connector.ledger.signMessageFailed"),
              content: t("connector.ledger.signMessageFailed.description"),
              size: "sm",
              onOk: async () => {
                console.log("-- use ledger", true);
                setLedgerAddress(data.userAddress);

                return Promise.resolve();
              },
              okLabel: t("common.ok"),
              onCancel: async () => {
                toast.error(data.message);
                return Promise.resolve();
              },
              cancelLabel: t("common.no"),
            })
            .then((res) => {
              console.log("-- dialog res", res);
            });
        });
      }
    );
  }, [ee, t]);

  return {};
}
