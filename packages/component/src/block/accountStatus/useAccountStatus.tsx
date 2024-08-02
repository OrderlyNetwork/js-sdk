import React, { useCallback } from "react";
import { modal } from "@orderly.network/ui";
import { toast } from "@/toast";

export const useAccountStatus = () => {
  const onSettle = useCallback(() => {
    return modal.confirm({
      title: "Settle PnL",
      content: (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs">
          Are you sure you want to settle your PnL? Settlement will take up to 1
          minute before you can withdraw your available balance.
        </div>
      ),
      onCancel: () => {
        return Promise.reject();
      },
      onOk: () => {
        // @ts-ignore
        if (typeof props.onSettle !== "function") return Promise.resolve();
        // @ts-ignore
        return props.onSettle().catch((e) => {});
      },
    });
  }, []);

  return {
    onSettle,
  };
};
