import { DialogTitle } from "@orderly.network/react";
import { DialogHeader } from "@orderly.network/react";
import { DialogContainer, DialogBody } from "@orderly.network/react";

export const DialogComponent = () => {
  return (
    <>
      <DialogHeader>Settle</DialogHeader>
      <DialogBody>Are you sure you want to settle your PnL?</DialogBody>
    </>
  );
};
