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
  } = props;

  const [approveLoading, setApproveLoading] = useState(false);

  const onClick = useCallback(() => {
    if (approveLoading) return;
    setApproveLoading(true);
    onApprove?.()
      .then(
        (result) => {
          //
          toast.success("Approve success");
        },
        (error) => {
          //
          toast.error(error?.errorCode);
        }
      )
      .finally(() => {
        setApproveLoading(false);
      });
  }, [approveLoading, allowance, quantity]);

  if (allowance <= 0) {
    return (
      <Button
        fullWidth
        loading={approveLoading}
        onClick={onClick}
        disabled={approveLoading}
      >
        {`Approve ${token}`}
      </Button>
    );
  }

  if (allowance < Number(quantity) && Number(quantity) <= Number(maxQuantity)) {
    return (
      <Button
        fullWidth
        loading={approveLoading}
        onClick={onClick}
        disabled={approveLoading}
      >
        {`increase ${token} authorized amount`}
      </Button>
    );
  }

  return (
    <Button
      fullWidth
      onClick={onDeposit}
      disabled={disabled || submitting}
      loading={submitting}
    >
      {label}
    </Button>
  );
};
