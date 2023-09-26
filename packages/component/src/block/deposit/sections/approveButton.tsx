import Button from "@/button";
import { toast } from "@/toast";
import { FC, useCallback, useState } from "react";

interface ApproveButtonProps {
  onApprove?: () => Promise<any>;
  onDeposit: () => Promise<any>;
  allowance: string;
  quantity: string;
  submitting: boolean;
}

export const ApproveButton: FC<ApproveButtonProps> = (props) => {
  const { onApprove, onDeposit, allowance, submitting, quantity } = props;

  const [approveLoading, setApproveLoading] = useState(false);

  const onClick = useCallback(() => {
    if (approveLoading) return;
    setApproveLoading(true);
    onApprove?.()
      .then(
        (result) => {
          console.log(result);
          toast.success("Approve success");
        },
        (error) => {
          //   console.log(error);
          toast.error(error?.errorCode);
        }
      )
      .finally(() => {
        setApproveLoading(false);
      });
  }, [approveLoading, allowance, quantity]);

  if (Number(allowance) <= 0) {
    return (
      <Button fullWidth loading={approveLoading} onClick={onClick}>
        Approve USDC
      </Button>
    );
  }

  return (
    <Button
      fullWidth
      onClick={onDeposit}
      disabled={!quantity || submitting}
      loading={submitting}
    >
      Deposit
    </Button>
  );
};
