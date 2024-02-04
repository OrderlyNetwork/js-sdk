import { FC, useCallback, useContext, useEffect, useState } from "react";

import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/deposit/sections/summary";
import { NetworkImage } from "@/icon/networkImage";
import { useLocalStorage } from "@orderly.network/hooks";

import { MoveDownIcon } from "@/icon";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { Decimal, int2hex } from "@orderly.network/utils";

import { toast } from "@/toast";
import { CurrentChain, type API } from "@orderly.network/types";
import { modal } from "@/modal";
import { SwapDialog } from "../swap/swapDialog";
import { SwapMode } from "../swap/sections/misc";
import { NumberReg } from "@/utils/num";
import { OrderlyAppContext } from "@/provider";
import { Logo } from "@/logo";
import { DepositContext } from "./DepositProvider";
import { useSwapEnquiry } from "./hooks/useSwapEnquiry";

export type DST = {
  symbol: string;
  address?: string;
  decimals?: number;
  chainId: number;
  network: string;
};

export interface DepositFormProps {
  displayDecimals: number;
  chains?: API.NetworkInfos[];
  chain: CurrentChain | null;

  token?: API.TokenInfo;
  dst: DST;
  address?: string;
  walletName?: string;
  minAmount: number;
  maxAmount: string;

  allowance: string;

  balanceRevalidating: boolean;
  settingChain?: boolean;
  isNativeToken?: boolean;

  switchChain: (options: {
    chainId: string;
    [key: string]: any;
  }) => Promise<any>;

  switchToken?: (token: API.TokenInfo) => void;

  fetchBalance: (token: string, decimals: number) => Promise<any>;

  approve: (amount?: string) => Promise<any>;
  deposit: () => Promise<any>;

  onOk?: (data: any) => void;

  quantity: string;
  setQuantity: (quantity: string) => void;
  depositFee?: bigint;
  depositFeeRevalidating?: boolean;
}

export const DepositForm: FC<DepositFormProps> = (props) => {
  const {
    maxAmount,
    walletName,
    address,
    chains,
    chain,
    dst,
    switchChain,
    onOk,
    isNativeToken,
    quantity,
    setQuantity,
    depositFee,
  } = props;

  const { errors, brokerName } =
    useContext(OrderlyAppContext);
  const { needSwap, needCrossSwap } = useContext(DepositContext);

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);
  const [slippage, setSlippage] = useLocalStorage("ORDERLY_SLIPPAGE", 1);

  const {
    enquiry,
    transactionInfo,
    amount,
    querying,
    warningMessage,
    cleanTransactionInfo,
  } = useSwapEnquiry({
    quantity,
    dst,
    queryParams: {
      network: dst.network,
      srcToken: props.token?.address,
      srcNetwork: chain?.info.network_infos?.shortName,
      dstToken: dst.address,
      crossChainRouteAddress:
        chain?.info?.network_infos?.woofi_dex_cross_chain_router,
      amount: new Decimal(quantity || 0)
        .mul(10 ** (props.token?.decimals || 0))
        .toString(),
      slippage,
    },
  });

  const cleanData = () => {
    cleanTransactionInfo();
    setQuantity("");
  };

  const onSwapDeposit = useCallback(() => {
    enquiry()
      .then((transaction) => {
        const amountValue = needCrossSwap
          ? transaction.route_infos?.dst.amounts[1]
          : transaction.route_infos?.amounts[1];

        // @ts-ignore
        return modal.show(SwapDialog, {
          mode: needCrossSwap ? SwapMode.Cross : SwapMode.Single,
          src: {
            chain: chain?.id,
            token: props.token!.symbol,
            displayDecimals: props.token!.woofi_dex_precision,
            amount: quantity,
            decimals: props.token!.decimals,
          },
          dst: {
            chain: dst.chainId,
            token: dst.symbol,
            displayDecimals: 2,
            amount: new Decimal(amountValue)
              .div(Math.pow(10, dst.decimals!))
              .toString(),
            decimals: dst.decimals,
          },
          chain: chain?.info?.network_infos,
          nativeToken: chain?.info.nativeToken,
          depositFee,
          transactionData: transaction,
          slippage,
          brokerName,
        });
      })
      .then((isSuccss) => {
        if (isSuccss) {
          cleanData();
        }
      })
      .catch((error) => {
        // toast.error(error?.message || "Error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [quantity, needCrossSwap, dst, chain, slippage, depositFee, brokerName]);

  const onDirectDeposit = useCallback(() => {
    props
      .deposit()
      .then((res: any) => {
        setQuantity("");
        toast.success("Deposit requested");
        onOk?.(res);
      })
      .catch((error) => {
        toast.error(error?.errorCode || "Deposit failed");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [props.deposit]);

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    if (!props.token) {
      toast.error("Please select a token");
      return;
    }

    if (isNaN(num) || num <= 0) {
      toast.error("Please input a valid number");
      return;
    }

    if (inputStatus !== "default") {
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    if (needSwap || needCrossSwap) {
      onSwapDeposit();
    } else {
      onDirectDeposit();
    }
  }, [
    quantity,
    submitting,
    needSwap,
    needCrossSwap,
    onDirectDeposit,
    onSwapDeposit,
  ]);

  const onApprove = useCallback(async () => {
    return props.approve(quantity);
  }, [quantity, props.approve]);

  const onValueChange = useCallback(
    (value: any) => {
      if (value.value === ".") {
        setQuantity("0.");
        return;
      }

      const result = (value.value as string).match(NumberReg);

      if (Array.isArray(result)) {
        value = result[0];
        if (isNaN(parseFloat(value))) {
          setQuantity("");
        } else {
          let d = new Decimal(value);
          if (d.dp() > dst.decimals!) {
            setQuantity(d.todp(Math.min(dst.decimals!, 8)).toString());
          } else {
            setQuantity(value);
          }

          if (d.gt(maxAmount)) {
            setInputStatus("error");
            setHintMessage("Insufficient balance");
          } else {
            // reset input status
            setInputStatus("default");
            setHintMessage("");
          }
        }
      } else {
        setQuantity("");
        // reset input status when value is empty
        setInputStatus("default");
        setHintMessage("");
      }
    },
    [dst.decimals, maxAmount]
  );

  const onTokenChange = (token: API.TokenInfo) => {
    cleanData();
    props.switchToken?.(token);
  };

  const onChainChange = useCallback(
    (value: API.Chain) => {
      if (!value) return;
      if (value.network_infos?.chain_id === chain?.id) return Promise.resolve();
      props
        .switchChain?.({
          chainId: int2hex(Number(value.network_infos?.chain_id)),
          rpcUrl: value.network_infos?.public_rpc_url,
          token: value.network_infos?.currency_symbol,
          // name: chain.network_infos?.name,
          label: value.network_infos?.name,
          // vaultAddress: chain.network_infos?.woofi_dex_cross_chain_router,
        })
        .then(() => {
          // switch success，set tokens list
          setTokens(
            value?.token_infos.filter((chain) => !!chain.swap_enable) ?? []
          );
          toast.success("Network switched");
          cleanData();
        })
        .catch((error) => {
          toast.error(`Switch chain failed: ${error.message}`);
        });
    },
    [props.switchChain, chain]
  );

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chain: API.Chain) => {
      if (chain && chain.token_infos?.length > 0) {
        const tokens = chain.token_infos;

        let token = tokens.find(
          (t: API.TokenInfo) => t.symbol === "USDC" || t.symbol === "USDbC"
        );

        if (!token) token = tokens[0];

        setTokens(tokens);

        if (!token) return;

        props.switchToken?.(token);
      }
    },
    [props.token?.symbol]
  );

  useEffect(() => {
    // check quantity
    if (isNaN(Number(quantity)) || !quantity) return;

    const d = new Decimal(quantity);

    if (d.gt(maxAmount)) {
      setInputStatus("error");
      setHintMessage("Insufficient balance");
    } else {
      setInputStatus("default");
      setHintMessage("");
    }
  }, [maxAmount]);

  return (
    <div id="orderly-deposit-form">
      <div className="orderly-flex orderly-items-center orderly-py-2">
        <div className="orderly-flex-1 orderly-text-2xs desktop:orderly-text-base orderly-text-base-con">
          Your web3 wallet
        </div>
        <NetworkImage
          type={typeof walletName === "undefined" ? "placeholder" : "wallet"}
          name={walletName?.toLowerCase()}
          rounded
        />
      </div>
      <div className="orderly-pb-2">
        <WalletPicker
          address={address}
          chain={chain}
          settingChain={props.settingChain}
          onChainChange={onChainChange}
          onChainInited={onChainInited}
        />
      </div>
      <QuantityInput
        tokens={tokens}
        token={props.token}
        quantity={quantity}
        markPrice={
          needCrossSwap || needSwap
            ? isNativeToken
              ? transactionInfo.markPrices.native_token
              : transactionInfo.markPrices.from_token
            : 1
        }
        maxAmount={Number(maxAmount)}
        onValueChange={onValueChange}
        status={inputStatus}
        decimals={dst.decimals!}
        hintMessage={hintMessage}
        fetchBalance={props.fetchBalance}
        onTokenChange={onTokenChange}
        balanceRevalidating={props.balanceRevalidating}
        disabled={errors?.ChainNetworkNotSupport}
      />

      <Divider className="orderly-py-4">
        <MoveDownIcon className="orderly-text-primary-light" />
      </Divider>
      <div className="orderly-flex orderly-py-2">
        <div className="orderly-flex-1 orderly-text-2xs orderly-text-base-contrast desktop:orderly-text-base">
          {"Your " + brokerName + " account"}
        </div>

        <Logo.secondary size={24} />
      </div>
      <div className="orderly-py-2">
        <TokenQtyInput
          token={dst}
          amount={amount}
          loading={querying}
          readOnly
          fee={Number(transactionInfo.fee)}
        />
      </div>
      <div className="orderly-flex orderly-items-start orderly-py-4 orderly-text-3xs orderly-text-tertiary">
        <Summary
          isNativeToken={isNativeToken}
          nativeToken={chain?.info?.nativeToken}
          src={props.token}
          dst={dst}
          price={transactionInfo.price}
          fee={transactionInfo.fee}
          markPrices={transactionInfo.markPrices}
          swapFee={transactionInfo.swapFee}
          bridgeFee={transactionInfo.bridgeFee}
          destinationGasFee={transactionInfo.dstGasFee}
          slippage={slippage}
          onSlippageChange={setSlippage}
          depositFee={depositFee}
        />
      </div>
      <ActionButton
        chain={chain}
        chains={chains!}
        token={props.token}
        onDeposit={onDeposit}
        allowance={
          props.isNativeToken ? Number.MAX_VALUE : Number(props.allowance)
        }
        chainNotSupport={!!errors?.ChainNetworkNotSupport}
        disabled={
          !quantity || inputStatus === "error" || props.depositFeeRevalidating!
        }
        loading={submitting || props.depositFeeRevalidating! || querying}
        submitting={submitting || props.depositFeeRevalidating! || querying}
        switchChain={switchChain}
        quantity={quantity}
        onApprove={onApprove}
        maxQuantity={maxAmount}
        warningMessage={warningMessage}
        onChainChange={onChainChange}
      />
    </div>
  );
};
