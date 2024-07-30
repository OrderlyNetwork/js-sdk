import React from "react";
import { Box, Button, ButtonProps } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { NetworkId } from "@orderly.network/types";

export type ActionButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  actionType: ActionType;
  symbol?: string;
    onDeposit?: () => void;
    onApprove?: () => void;
    onWithdraw?: () => void;
    onSwitchToArbitrum?:() => void;
  networkId?: NetworkId;
};

export enum ActionType {
  Deposit,
  Approve,
  Increase,
  Withdraw,
  SwitchToArbitrum,
}

export const ActionButton: React.FC<ActionButtonProps> = (props) => {
  const {
    disabled,
    loading,
    actionType,
    symbol = "USDC",
    onDeposit,
    onApprove,
      onWithdraw,
      onSwitchToArbitrum,
    networkId,
  } = props;

  const renderButton = () => {
    const params: Record<ActionType, ButtonProps> = {
      [ActionType.Approve]: {
        children: `Approve ${symbol}`,
        onClick: onApprove,
      },
      [ActionType.Increase]: {
        children: `increase ${symbol} authorized amount`,
        onClick: onApprove,
      },
      [ActionType.Deposit]: {
        children: "Deposit",
        onClick: onDeposit,
      },
      [ActionType.Withdraw]: {
        children: "Withdraw",
        onClick:onWithdraw,
      },
      [ActionType.SwitchToArbitrum]: {
        children: "Withdraw",
        onClick:onSwitchToArbitrum,
      },
    };

    return (
      <Button
        fullWidth
        disabled={disabled}
        loading={loading}
        {...params[actionType]}
      />
    );
  };

  return (
    <Box width={184}>
      <AuthGuard networkId={networkId} buttonProps={{ fullWidth: true }}>
        {renderButton()}
      </AuthGuard>
    </Box>
  );
};
