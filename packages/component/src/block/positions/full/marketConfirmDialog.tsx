import { FC } from "react";
import { ConfirmFooter } from "./confrimFooter";
import { ConfirmHeader } from "./confirmHeader";

export const CloseBaseConfirm: FC<{
  base: string;
  quantity: string;
  onClose: () => void;
  onConfirm: () => Promise<any>;
}> = (props) => {
  const onCancel = () => {
    props.onClose();
  };
  return (
    <>
      <ConfirmHeader onClose={onCancel} title="Market Close" />
      <div className="orderly-text-base-contrast orderly-text-sm orderly-mt-5">
        {`You agree closing ${props.quantity} ${props.base} position at market price.`}
      </div>
      <div className="orderly-text-base-contrast-54 orderly-text-2xs orderly-mt-3">
        Pending reduce-only orders will be cancelled or adjusted.
      </div>
      <ConfirmFooter onCancel={onCancel} onConfirm={props.onConfirm} />
    </>
  );
};
