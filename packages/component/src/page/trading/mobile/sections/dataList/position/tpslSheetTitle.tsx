import { ModalContext, ModalIdContext } from "@orderly.network/ui";
import { AlgoOrderRootType } from "@orderly.network/types";
import { useContext, useEffect, useState } from "react";

export const TPSLSheetTitle = () => {
  const [title, setTitle] = useState("TP / SL");
  const mid = useContext(ModalIdContext);
  const ctx = useContext(ModalContext);
  const state = ctx[mid!];

  useEffect(() => {
    if (
      ((state as any).type as AlgoOrderRootType) ===
      AlgoOrderRootType.POSITIONAL_TP_SL
    ) {
      setTitle("Position TP/SL");
    } else {
      setTitle("TP / SL");
    }
  }, [(state as any).type]);

  return <div>{title}</div>;
};
