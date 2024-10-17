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
    title: "Review swap details",
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
