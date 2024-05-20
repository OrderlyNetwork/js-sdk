import Button from "@/button";
import { FC } from "react";

export const ConfirmFooter: FC<{
  onConfirm: () => Promise<any>;
  onCancel: () => void;
  submitting: boolean;
}> = ({ onCancel, onConfirm, submitting }) => {
  return (
    <div id="orderly-positions-confrim-fotter" className="orderly-grid orderly-grid-cols-[1fr_2fr] orderly-mt-5">
      <div />
      <div className="orderly-flex orderly-gap-2">
        <Button id="orderly-positions-cancel-button" color={"tertiary"} fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button id="orderly-positions-confirm-button" onClick={onConfirm} fullWidth loading={submitting}>
          Confirm
        </Button>
      </div>
    </div>
  );
};
