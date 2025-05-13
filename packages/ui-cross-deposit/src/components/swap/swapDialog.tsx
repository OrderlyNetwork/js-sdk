import { useTranslation } from "@orderly.network/i18n";
import {
  modal,
  SimpleDialog,
  SimpleSheet,
  useModal,
  useScreen,
} from "@orderly.network/ui";
import { Swap, SwapProps } from "./swap";

export const SwapDialog = modal.create<SwapProps>((props) => {
  const { isMobile } = useScreen();
  const { t } = useTranslation();

  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onComplete = (isSuccss: boolean) => {
    resolve(isSuccss);
    hide();
  };

  const onCancel = () => {
    reject();
    hide();
  };

  const commonProps = {
    title: t("transfer.crossDeposit.swapDialog.title"),
    open: visible,
    onOpenChange,
    classNames: {
      content: "oui-font-semibold",
    },
    children: <Swap {...props} onComplete={onComplete} onCancel={onCancel} />,
  };

  if (isMobile) {
    return <SimpleSheet {...commonProps} />;
  }

  return <SimpleDialog {...commonProps} size="md" />;
});
