import Button from "@/button";
import { toast } from "@/toast";
import { FC, useCallback, useState } from "react";

interface ApproveButtonProps {
  onApprove?: () => Promise<any>;
  onDeposit: () => Promise<any>;
  allowance: number;
  maxQuantity: string;
  quantity: string;
  submitting: boolean;
  token?: string;
  label: string;
  disabled?: boolean;
  buttonId: string;
  depositFeeRevalidating?: boolean;
}

export const ApproveButton: FC<ApproveButtonProps> = (props) => {
  const {
    onApprove,
    onDeposit,
    allowance,
    submitting,
    quantity,
    disabled,
    maxQuantity,
    token = "USDC",
    label,
    buttonId,
  } = props;

  const [approveLoading, setApproveLoading] = useState(false);

  const onClick = useCallback(() => {
    if (approveLoading) return;
    setApproveLoading(true);
    onApprove?.()
      .then((res: any) => {
        toast.success("Approve success");
      })
      .catch((error) => {
        console.log("approve error", error);
        toast.error(error?.errorCode || "Approve failed");
      })
      .finally(() => {
        setApproveLoading(false);
      });
  }, [approveLoading, allowance, quantity, props.onApprove]);

  if (allowance <= 0) {
    return (
      <Button
        id={buttonId}
        fullWidth
        loading={approveLoading}
        onClick={onClick}
        disabled={approveLoading}
        className=" desktop:orderly-text-2xs"
      >
        {`Approve ${token}`}
      </Button>
    );
  }

  if (allowance < Number(quantity) && Number(quantity) <= Number(maxQuantity)) {
    return (
      <Button
        id={buttonId}
        fullWidth
        loading={approveLoading}
        onClick={onClick}
        disabled={approveLoading}
        className=" desktop:orderly-text-2xs"
      >
        {`increase ${token} authorized amount`}
      </Button>
    );
  }

  return (
    <Button
      id={buttonId}
      fullWidth
      onClick={onDeposit}
      disabled={disabled || submitting}
      loading={submitting}
      className="desktop:orderly-text-2xs"
    >
      {label}
    </Button>
  );
};
