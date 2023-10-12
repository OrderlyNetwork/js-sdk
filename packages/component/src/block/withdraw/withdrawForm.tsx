import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { Coin, MoveDownIcon } from "@/icon";
import { QuantityInput } from "@/block/quantityInput";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/withdraw/sections/summary";
import { WalletPicker } from "../pickers/walletPicker";
import { cn } from "@/utils/css";
import { NetworkImage } from "@/icon/networkImage";
import { API, WithdrawStatus, chainsMap } from "@orderly.network/types";
import { toast } from "@/toast";
import { Decimal } from "@orderly.network/utils";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { UnsettledInfo } from "./sections/settledInfo";

export interface WithdrawProps {
  status?: WithdrawStatus;
  chains?: API.ChainDetail[];
  chain: any | null;
  address?: string;
  walletName?: string;
  decimals: number;
  minAmount: number;
  maxAmount: number;
  availableBalance: number;
  unsettledPnL: number;
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
  maxAmount,
  onWithdraw,
  onOk,
  switchChain,
}) => {
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [submitting, setSubmitting] = useState(false);

  const chainInfo = useMemo(() => {
    if (chain) {
      return chainsMap.get(chain?.id);
    }
  }, [chain]);

  const [quantity, setQuantity] = useState("");

  // const openChainPicker = useCallback(() => {}, []);

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
      chainId: chain?.id,
    })
      .then(
        (res) => {
          console.log(res);
          toast.success("Withdraw request sent successfully");
          setQuantity("");

          onOk?.(res);
        },
        (error) => {
          // console.log(error);
          toast.error(error.message);
        }
      )
      .finally(() => {
        setSubmitting(false);
      });
  }, [quantity, minAmount, inputStatus, chain, submitting, onOk]);

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
    const item = chains?.find(
      (c) => parseInt(c.chain_id) === parseInt(chain!.id)
    );

    if (!item) {
      return 0;
    }

    return item.withdrawal_fee;
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
      <div className="flex items-center py-2">
        <div className="flex-1">Your WOOFi DEX Wallet</div>
        <Coin name="WOO" />
      </div>
      <QuantityInput
        tokens={[]}
        token={{
          symbol: "USDC",
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
      />
      <UnsettledInfo unsettledPnL={unsettledPnL} />
      <Divider className={"py-3"}>
        <MoveDownIcon className={"text-primary-light"} />
      </Divider>
      <div className={"flex items-center"}>
        <div className={"flex-1"}>Your Web3 Wallet</div>
        <NetworkImage
          type={typeof walletName === "undefined" ? "placeholder" : "wallet"}
          name={walletName?.toLowerCase()}
          rounded
        />
      </div>
      <div className={"py-2"}>
        <WalletPicker address={address} chain={chainInfo} />
      </div>
      <TokenQtyInput amount={quantity} fee={fee} />

      <Summary fee={fee} />

      <ActionButton
        chains={chains}
        chain={undefined}
        onWithdraw={doWithdraw}
        disabled={!quantity}
        switchChain={switchChain}
        chainInfo={chainInfo}
        quantity={quantity}
        loading={submitting}
      />
    </>
  );
};
