import { useMemo } from "react";
import { useAccount, useGetEnv } from "@orderly.network/hooks";
import { useMutation } from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { VAULTS_CONTRACT_ADDRESSES } from "../../../contract";
import { OperationType, RoleType } from "../../../types/vault";
import { getToAccountPayloadType } from "../../../utils/operationPayload";
import { useLatestOperationScript } from "./latest.script";

type OperationScript = {
  type: OperationType;
  vaultId: string;
};

export const useOperationScript = (props: OperationScript) => {
  const { account, state } = useAccount();
  const env = useGetEnv();
  const verifyingContract = useMemo(() => {
    return VAULTS_CONTRACT_ADDRESSES[
      env as keyof typeof VAULTS_CONTRACT_ADDRESSES
    ].vaultPvLedger;
  }, [env]);
  const [postVaultOperation] = useMutation("/v1/sv_operation_request");
  const { refetch: refetchOperationHistory } = useLatestOperationScript({
    type: props.type,
    vaultId: props.vaultId,
  });

  const handleOperation = async ({
    amount,
    vaultId,
  }: {
    amount: string;
    vaultId: string;
  }) => {
    const payloadType = getToAccountPayloadType(props.type, RoleType.LP);
    const requestParams = {
      payloadType,
      amount: new Decimal(Number(amount)).mul(10 ** 6).toString(),
      vaultId,
      token: "USDC",
      domain: {
        name: "Orderly",
        version: "1",
        chainId: state.connectWallet?.chainId as number,
        verifyingContract,
      },
    };

    const { message, signatured } =
      await account.generateDexRequest(requestParams);

    try {
      const res = await postVaultOperation({
        message: {
          ...message,
          chainId: state.connectWallet?.chainId as number,
        },
        signature: signatured,
        userAddress: state.address,
        verifyingContract,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      await refetchOperationHistory();

      toast.success(`${props.type} successful`);
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return {
    handleOperation,
  };
};
