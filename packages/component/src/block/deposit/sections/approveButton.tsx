import Button from "@/button";
import { toast } from "@/toast";
import { FC, useCallback, useState } from "react";

interface ApproveButtonProps {
  onApprove?: () => Promise<any>;
  onDeposit: () => Promise<any>;
  allowance: string;
  maxQuantity: string;
  quantity: string;
  submitting: boolean;
}

export const ApproveButton: FC<ApproveButtonProps> = (props) => {
  const { onApprove, onDeposit, allowance, submitting, quantity, maxQuantity } =
    props;

  const [approveLoading, setApproveLoading] = useState(false);

  const onClick = useCallback(() => {
    if (approveLoading) return;
    setApproveLoading(true);
    onApprove?.()
      .then(
        (result) => {
          // console.log(result);
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
      <Button
        className="min-w-[200px]"
        loading={approveLoading}
        onClick={onClick}
      >
        Approve USDC
      </Button>
    );
  }

  if (
    Number(allowance) < Number(quantity) &&
    Number(quantity) <= Number(maxQuantity)
  ) {
    return (
      <Button
        className="min-w-[200px]"
        loading={approveLoading}
        onClick={onClick}
      >
        increase USDC authorized amount
      </Button>
    );
  }

  return (
    <Button
      className="min-w-[200px]"
      onClick={onDeposit}
      disabled={!quantity || submitting}
      loading={submitting}
    >
      Deposit
    </Button>
  );
};
