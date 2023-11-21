import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { Coin, MoveDownIcon } from "@/icon";
import { QuantityInput } from "@/block/quantityInput";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/withdraw/sections/summary";
import { WalletPicker } from "../pickers/walletPicker";
import { cn } from "@/utils/css";
import { NetworkImage } from "@/icon/networkImage";
import { API, CurrentChain, WithdrawStatus } from "@orderly.network/types";
import { toast } from "@/toast";
import { Decimal } from "@orderly.network/utils";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { UnsettledInfo } from "./sections/settledInfo";
import { ChainDialog } from "../pickers/chainPicker/chainDialog";
import { modal } from "@/modal";

export interface WithdrawProps {
  status?: WithdrawStatus;
  chains: API.NetworkInfos[];
  chain: CurrentChain | null;
  address?: string;
  walletName?: string;
  decimals: number;
  minAmount: number;
  maxAmount: number;
  availableBalance: number;
  unsettledPnL: number;
  hasPositions: boolean;
  // fee:number
  switchChain: (options: { chainId: string }) => Promise<any>;
  onWithdraw: (inputs: {
    chainId: number;
    // receiver: string;
    token: string;
    amount: number;
  }) => Promise<any>;

  onOk?: (data: any) => void;
}

const numberReg = /^([0-9]{1,}[.]?[0-9]*)/;

export const WithdrawForm: FC<WithdrawProps> = ({
  status = WithdrawStatus.Normal,
  chains,
  chain,
  decimals,
  address,
  walletName,
  minAmount,
  availableBalance,
  unsettledPnL,
  hasPositions,
  maxAmount,
  onWithdraw,
  onOk,
  switchChain,
}) => {
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [submitting, setSubmitting] = useState(false);

  const [quantity, setQuantity] = useState("");

  const openChainPicker = useCallback(async () => {
    const result = await modal.show<{ id: number; name: string }, any>(
      ChainDialog,
      {
        testChains: chains,
        currentChainId: chain?.id,
      }
    );
    return result;
  }, [chains, chain]);

  // const switchChain = useCallback((chainId: string) => {}, []);

  const doWithdraw = useCallback(() => {
    if (submitting) return;

    const num = Number(quantity);
    if (num < minAmount) {
      toast.error(`quantity must large than ${minAmount}`);
      return;
    }

    if (inputStatus !== "default") {
      return;
    }

    setSubmitting(true);

    return onWithdraw({
      amount: Number(quantity),
      token: "USDC",
      chainId: chain?.id!,
    })
      .then(
        (res) => {
          toast.success("Withdraw request sent successfully");
          setQuantity("");

          onOk?.(res);
        },
        (error) => {
          toast.error(error.message);
        }
      )
      .finally(() => {
        setSubmitting(false);
      });
  }, [quantity, minAmount, inputStatus, chain?.id, submitting, onOk]);

  const onValueChange = useCallback(
    (value: any) => {
      if (value.value === ".") {
        setQuantity("0.");
        return;
      }

      const result = (value.value as string).match(numberReg);

      if (Array.isArray(result)) {
        value = result[0];
        // value = parseFloat(value);
        if (isNaN(parseFloat(value))) {
          setQuantity("");
        } else {
          let d = new Decimal(value);
          // setQuantity(value);
          if (d.dp() > decimals) {
            setQuantity(d.todp(Math.min(decimals, 8)).toString());
          } else {
            setQuantity(value);
          }
        }
      } else {
        setQuantity("");
      }
    },
    [decimals]
  );

  const fee = useMemo(() => {
    if (!chain) return 0;

    const item = chains?.find((c) => c.chain_id === chain!.id);

    //

    if (!item) {
      return 0;
    }

    return item.withdrawal_fee || 0;
  }, [chain, chains]);

  useEffect(() => {
    const num = Number(quantity);
    if (num > maxAmount) {
      if (num <= availableBalance) {
        setInputStatus("warning");
        setHintMessage("Please settle your balance");
      } else {
        setInputStatus("error");
        setHintMessage("Insufficient balance");
      }
    } else {
      setInputStatus("default");
      setHintMessage(undefined);
    }
  }, [quantity, maxAmount, availableBalance]);

  return (
    <>
      <div className="flex items-center py-2 text-2xs text-base-contrast">
        <div className="flex-1">Your WOOFi Pro account</div>
        <NetworkImage type={"path"} rounded path={"/images/woofi-little.svg"} />
      </div>
      <QuantityInput
        tokens={[]}
        // @ts-ignore
        token={{
          symbol: "USDC",
          decimals: 6,
        }}
        decimals={decimals}
        status={inputStatus}
        className={cn(status !== WithdrawStatus.Normal && "outline outline-1", {
          "outline-trade-loss": status === WithdrawStatus.InsufficientBalance,
          "outline-yellow-500": status === WithdrawStatus.Unsettle,
        })}
        quantity={quantity}
        onValueChange={onValueChange}
        maxAmount={maxAmount}
        hintMessage={hintMessage}
        markPrice={1}
      />
      <UnsettledInfo unsettledPnL={unsettledPnL} hasPositions={hasPositions} />
      <Divider className={"py-3"}>
        <MoveDownIcon className={"text-primary-light"} />
      </Divider>
      <div className={"flex items-center text-2xs"}>
        <div className={"flex-1"}>Your web3 wallet</div>
        <NetworkImage
          type={typeof walletName === "undefined" ? "placeholder" : "wallet"}
          name={walletName?.toLowerCase()}
          rounded
        />
      </div>
      <div className={"py-2"}>
        <WalletPicker address={address} chain={chain} wooSwapEnabled={false} />
      </div>
      <TokenQtyInput
        amount={quantity}
        fee={fee}
        needCalc
        token={{
          symbol: "USDC",
          decimals: 6,
        }}
      />

      <Summary fee={fee} />

      <ActionButton
        chains={chains}
        chain={chain}
        onWithdraw={doWithdraw}
        disabled={!quantity}
        switchChain={switchChain}
        quantity={quantity}
        loading={submitting}
        openChainPicker={openChainPicker}
      />
    </>
  );
};
