import { useEffect } from "react";
import { useEventEmitter } from "@orderly.network/hooks";
import { useStorageLedgerAddress } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  LedgerWalletKey,
  SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";

export function useWalletConnectError() {
  const { t } = useTranslation();
  const ee = useEventEmitter();
  const { setLedgerAddress } = useStorageLedgerAddress();

  useEffect(() => {
    const handleConnectError = (data: { message: string }) => {
      toast.error(
        data.message === SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY
          ? t(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY)
          : data.message,
      );
    };

    const handleLedgerError = (data: {
      userAddress: string;
      message: string;
    }) => {
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
    };

    ee.on("wallet:connect-error", handleConnectError);
    ee.on("wallet:sign-message-with-ledger-error", handleLedgerError);

    return () => {
      ee.off("wallet:connect-error", handleConnectError);
      ee.off("wallet:sign-message-with-ledger-error", handleLedgerError);
    };
  }, [ee, t]);

  return {};
}
