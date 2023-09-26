import { FC, useCallback, useMemo, useState } from "react";
import { Input } from "@/input";
import Button from "@/button";
import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/deposit/sections/summary";
import { NetworkImage } from "@/icon/networkImage";
import { StatusGuardButton } from "@/button/statusGuardButton";

import { Chain, Wallet } from "@/block/pickers/walletPicker/walletPicker";
import { MoveDownIcon, SvgImage } from "@/icon";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { Decimal } from "@orderly.network/utils";
import { API, chainsMap } from "@orderly.network/types";
import { toast } from "@/toast";

export interface DepositFormProps {
  decimals: number;
  // status?: WithdrawStatus;
  chains?: API.ChainDetail[];
  chain: any | null;

  address?: string;
  walletName?: string;
  minAmount: number;
  maxAmount: string;

  allowance: string;

  switchChain: (options: { chainId: string }) => Promise<any>;

  approve: (amount: string) => Promise<any>;
  deposit: (amount: string) => Promise<any>;
}

const numberReg = /^([0-9]{1,}[.]?[0-9]*)/;

export const DepositForm: FC<DepositFormProps> = (props) => {
  const { decimals, minAmount, maxAmount, walletName, address, chains, chain } =
    props;

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [submitting, setSubmitting] = useState(false);

  const [quantity, setQuantity] = useState<string>("");

  const chainInfo = useMemo(() => {
    if (chain) {
      return chainsMap.get(chain?.id);
    }
  }, [chain]);

  // const [status, setStatus] = useState<DepositStatus>(DepositStatus.Normal);
  const onDeposit = useCallback(() => {
    const num = Number(quantity);
    const maxNum = Number(maxAmount);

    if (isNaN(num) || num <= 0) {
      toast.error("Please input a valid number");
      return;
    }

    if (inputStatus !== "default") {
      return;
    }

    // if (num > maxNum) {
    //   toast.error("Insufficient balance");
    //   return;
    // }

    if (submitting) return;

    setSubmitting(true);

    return props
      .deposit?.(quantity)
      .then(
        () => {
          setQuantity("");
          toast.success("Deposit success");
        },
        (error) => {
          toast.error(error?.errorCode);
        }
      )
      .finally(() => {
        setSubmitting(false);
      });
  }, [quantity, maxAmount, submitting]);

  const onApprove = useCallback(() => {
    return props.approve(quantity || maxAmount || "0");
  }, [quantity, maxAmount]);

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

          if (d.gt(maxAmount)) {
            setInputStatus("error");
            setHintMessage("Insufficient balance");
          } else {
            setInputStatus("default");
            setHintMessage("");
          }
        }
      } else {
        setQuantity("");
      }
    },
    [decimals, maxAmount]
  );

  return (
    <div>
      <div className={"flex items-center py-2"}>
        <div className="flex-1">Your Web3 Wallet</div>
        <NetworkImage
          type={typeof walletName === "undefined" ? "placeholder" : "wallet"}
          name={walletName?.toLowerCase()}
          rounded
        />
      </div>
      <div className="py-2">
        <WalletPicker address={address} chains={chains} chain={chainInfo} />
      </div>
      <QuantityInput
        tokens={[]}
        quantity={quantity}
        maxAmount={Number(maxAmount)}
        onValueChange={onValueChange}
        status={inputStatus}
        decimals={decimals}
        hintMessage={hintMessage}
      />

      <Divider className={"py-4"}>
        <MoveDownIcon className={"text-primary-light"} />
      </Divider>
      <div className="flex py-2">
        <div className={"flex-1"}>Your WOOFi DEX Wallet</div>
        <NetworkImage type={"path"} rounded path={"/images/woofi-little.svg"} />
      </div>
      <div className={"py-2"}>
        <TokenQtyInput amount={quantity} readOnly fee={0} />
      </div>
      <Summary />
      <ActionButton
        chain={undefined}
        onDeposit={onDeposit}
        allowance={props.allowance}
        disabled={!quantity}
        switchChain={function (options: { chainId: string }): Promise<any> {
          throw new Error("Function not implemented.");
        }}
        loading={submitting}
        quantity={quantity}
        onApprove={onApprove}
        submitting={submitting}
      />
    </div>
  );
};
