import { useLocalStorage } from "@orderly.network/hooks";
import { useState } from "react";

export const useTPSLEditorBuilder = (props?: {
  // confirmContent:
}) => {
  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );

  const [open, setOpen] = useState(false);

  return {
    open,
    needConfirm,
  };
};

export type TPSLEditorBuilderState = ReturnType<typeof useTPSLEditorBuilder>;
