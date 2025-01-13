import { useMemo } from "react";
import { Box, Button, modal, useScreen } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { AccountStatusEnum, NetworkId } from "@orderly.network/types";
import { CrossWithdrawConfirm } from "../crossWithdrawConfirm";
import { Decimal } from "@orderly.network/utils";
import SwitchChainButton from "./SwitchChainButton";

interface IProps {
  disabled?: boolean;
  loading?: boolean;
  onWithdraw: () => Promise<void>;
  networkId?: NetworkId;
  crossChainWithdraw: boolean;
  address?: string;
  currentChain?: any;
  quantity: string;
  fee: number;
  checkIsBridgeless: boolean;
}

export const WithdrawAction = (props: IProps) => {
  const {
    disabled,
    loading,
    onWithdraw,
    networkId,
    crossChainWithdraw,
    address,
    currentChain,
    quantity,
    fee,
    checkIsBridgeless,
  } = props;

  const amount = useMemo(() => {
    if (!quantity) {
      return 0;
    }
    return new Decimal(quantity).minus(fee ?? 0).toNumber();
  }, [quantity, fee]);

  const preWithdraw = () => {
    if (crossChainWithdraw) {
      modal.confirm({
        title: "Confirm to withdraw",
        content: (
          <CrossWithdrawConfirm
            address={address!}
            amount={amount}
            currentChain={currentChain}
          />
        ),
        classNames: {
          content: "oui-font-semibold",
          body: "!oui-pb-0",
          footer: "!oui-pt-0",
        },

        onOk: async () => {
          onWithdraw();
        },
      });
      return;
    }
    onWithdraw();
  };

  const buttonSize = { initial: "md", lg: "lg" } as const;

  return (
    <Box className="oui-w-full lg:oui-w-auto lg:oui-min-w-[184px]">
      <AuthGuard
        status={AccountStatusEnum.EnableTrading}
        networkId={networkId}
        bridgeLessOnly
        buttonProps={{ fullWidth: true, size: buttonSize }}
      >
        {checkIsBridgeless ? (
          <Button
            data-testid="oui-testid-withdraw-dialog-withdraw-btn"
            fullWidth
            disabled={disabled}
            loading={loading}
            onClick={preWithdraw}
            size={buttonSize}
          >
            Withdraw
          </Button>
        ) : (
          <SwitchChainButton networkId={networkId} size={buttonSize} />
        )}
      </AuthGuard>
    </Box>
  );
};
