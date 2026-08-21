import { useCallback } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal, Text, useScreen } from "@orderly.network/ui";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "../component/walletConnector";

const OnboardingModalTitle = ({ status }: { status: AccountStatusEnum }) => {
  const { t } = useTranslation();
  const { state } = useAccount();
  const displayStatus = state.status < status ? status : state.status;

  if (displayStatus < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }

  if (displayStatus < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }

  return <Text>{t("connector.connectWallet")}</Text>;
};

export const useOnboardingModal = () => {
  const { isMobile } = useScreen();

  const openOnboardingModal = useCallback(
    async (status: AccountStatusEnum): Promise<void> => {
      await modal
        .show(isMobile ? WalletConnectorSheetId : WalletConnectorModalId, {
          initAccountState: status,
          title: <OnboardingModalTitle status={status} />,
        })
        .then(
          () => undefined,
          () => undefined,
        );
    },
    [isMobile],
  );

  const handleAccountStatus = useCallback(
    (status?: AccountStatusEnum) => {
      if (
        typeof status === "undefined" ||
        status <= AccountStatusEnum.Connected ||
        status >= AccountStatusEnum.EnableTrading
      ) {
        return;
      }

      void openOnboardingModal(status);
    },
    [openOnboardingModal],
  );

  return {
    openOnboardingModal,
    handleAccountStatus,
  } as const;
};
