import React, { useMemo } from "react";
import { Box, Button, ButtonProps } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { NetworkId } from "@orderly.network/types";
import { DepositAction } from "../../types";

export type ActionButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  actionType: DepositAction;
  symbol?: string;
  onDeposit?: () => void;
  onApprove?: () => void;
  networkId?: NetworkId;
};

export const ActionButton: React.FC<ActionButtonProps> = (props) => {
  const {
    disabled,
    loading,
    actionType,
    symbol = "USDC",
    onDeposit,
    onApprove,
    networkId,
  } = props;

  const buttonParams = useMemo(() => {
    const params: Record<DepositAction, ButtonProps> = {
      [DepositAction.Approve]: {
        children: `Approve ${symbol}`,
        onClick: onApprove,
        // approve not disabled button
        disabled: false,
        "data-testid": "oui-testid-deposit-dialog-approve-btn",
      },
      [DepositAction.Increase]: {
        children: `increase ${symbol} authorized amount`,
        onClick: onApprove,
        "data-testid": "oui-testid-deposit-dialog-increase-btn",
      },
      [DepositAction.Deposit]: {
        children: "Deposit",
        onClick: onDeposit,
        "data-testid": "oui-testid-deposit-dialog-deposit-btn",
      },
    };

    return params[actionType];
  }, [onApprove, onDeposit, actionType, symbol]);

  const buttonSize = { initial: "md", lg: "lg" } as const;

  return (
    <Box className="oui-w-full lg:oui-w-auto lg:oui-min-w-[184px]">
      <AuthGuard
        networkId={networkId}
        buttonProps={{
          fullWidth: true,
          size: buttonSize,
        }}
      >
        <Button
          fullWidth
          disabled={disabled}
          loading={loading}
          size={buttonSize}
          {...buttonParams}
        />
      </AuthGuard>
    </Box>
  );
};
