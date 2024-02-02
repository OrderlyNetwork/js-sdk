import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/deposit/sections/summary";
import { NetworkImage } from "@/icon/networkImage";
import {
  useDebouncedCallback,
  useLocalStorage,
  useBoolean,
} from "@orderly.network/hooks";

import { MoveDownIcon } from "@/icon";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { Decimal, int2hex } from "@orderly.network/utils";

import { toast } from "@/toast";
import { CurrentChain, type API } from "@orderly.network/types";
import { Notice } from "./sections/notice";
import { modal } from "@/modal";
import { SwapDialog } from "../swap/swapDialog";
import { SwapMode } from "../swap/sections/misc";
import { MarkPrices } from "./sections/misc";
import { NumberReg } from "@/utils/num";
import { OrderlyAppContext } from "@/provider";
import { Logo } from "@/logo";

export interface DepositFormProps {
  // decimals: number;
  displayDecimals: number;
  // status?: WithdrawStatus;
  chains?: API.NetworkInfos[];
  chain: CurrentChain | null;

  token?: API.TokenInfo;

  // dstToken: Partial<API.TokenInfo>;
  dst: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    network: string;
  };

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

  fetchBalances?: (tokens: API.TokenInfo[]) => Promise<any>;
  fetchBalance: (token: string, decimals: number) => Promise<any>;

  onEnquiry?: (inputs: any) => Promise<any>;

  approve: (amount?: string) => Promise<any>;
  deposit: () => Promise<any>;

  onOk?: (data: any) => void;

  needSwap: boolean;
  needCrossChain: boolean;
  symbolPrice: Record<string, number>;
  quantity: string;
  setQuantity: (quantity: string) => void;
  depositFee?: bigint;
  depositFeeRevalidating?: boolean;
}

export const DepositForm: FC<DepositFormProps> = (props) => {
  const {
    minAmount,
    maxAmount,
    walletName,
    address,
    chains,
    chain,
    dst,
    switchChain,
    onOk,
    isNativeToken,
    needCrossChain,
    needSwap,
    quantity,
    setQuantity,
    depositFee,
  } = props;

  const { errors, enableSwapDeposit, brokerName } =
    useContext(OrderlyAppContext);

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [warningMessage, setWarningMessage] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState<string>("");

  const [querying, { setTrue: queryStart, setFalse: queryStop }] =
    useBoolean(false);

  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const [slippage, setSlippage] = useLocalStorage("ORDERLY_SLIPPAGE", 1);

  const [transactionInfo, setTransactionInfo] = useState<{
    price: number;
    fee: string;
    markPrices: MarkPrices;
    swapFee?: string;
    bridgeFee?: string;
    dstGasFee?: string;
  }>({
    price: 0,
    markPrices: {
      from_token: 0,
      native_token: 0,
    },
    fee: "",
    // swapFee: "",
    // bridgeFee: "",
    // dstGasFee: "",
  });

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    if (!props.token) {
      toast.error("Please select a token");
      return Promise.reject();
    }

    if (isNaN(num) || num <= 0) {
      toast.error("Please input a valid number");
      return Promise.reject();
    }

    if (submitting) return Promise.reject();

    setSubmitting(true);

    // if not need cross chain and not need swap
    if (!needCrossChain && !needSwap) {
      return Promise.resolve().then(() => {
        if (inputStatus !== "default") {
          return;
        }

        return props
          .deposit?.()
          .then(
            (res: any) => {
              setQuantity("");
              toast.success("Deposit requested");
              onOk?.(res);
              // cleanData();
            },
            (error) => {
              toast.error(error?.errorCode);
            }
          )
          .finally(() => {
            setSubmitting(false);
          });
      });
    }

    // need swap
    return Promise.resolve()
      .then(() => enquiry())
      .then((transaction) => {
        const amountValue = needCrossChain
          ? transaction.route_infos.dst.amounts[1]
          : transaction.route_infos.amounts[1];

        //@ts-ignore
        return modal.show(SwapDialog, {
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
              .div(Math.pow(10, dst.decimals))
              .toString(),
            decimals: dst.decimals,
          },

          slippage,
          mode: needCrossChain ? SwapMode.Cross : SwapMode.Single,
          transactionData: transaction,
          chain: chain?.info?.network_infos,
          nativeToken: chain?.info.nativeToken,
          depositFee,
          brokerName,
        });
      })
      .then(
        (isSuccss) => {
          if (isSuccss) {
            cleanData();
            setQuantity("");
          }
        },
        (error) => {
          //
          // toast.error(error?.message || "Error");
        }
      )
      .finally(() => {
        setSubmitting(false);
      });
  }, [
    quantity,
    maxAmount,
    submitting,
    needCrossChain,
    needSwap,
    chain?.info,
    slippage,
    depositFee,
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
        // value = parseFloat(value);
        if (isNaN(parseFloat(value))) {
          setQuantity("");
        } else {
          let d = new Decimal(value);
          // setQuantity(value);
          if (d.dp() > dst.decimals) {
            setQuantity(d.todp(Math.min(dst.decimals, 8)).toString());
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
    setQuantity("");

    props.switchToken?.(token);
  };

  const onChainChange = useCallback(
    (value: API.Chain) => {
      if (!value) return;
      if (value.network_infos?.chain_id === chain?.id) return Promise.resolve();
      return props
        .switchChain?.({
          chainId: int2hex(Number(value.network_infos?.chain_id)),
          rpcUrl: value.network_infos?.public_rpc_url,
          token: value.network_infos?.currency_symbol,
          // name: chain.network_infos?.name,
          label: value.network_infos?.name,
          // vaultAddress: chain.network_infos?.woofi_dex_cross_chain_router,
        })
        .then(
          () => {
            // 切换成功后，设置token列表

            setTokens(
              value?.token_infos.filter((chain) => !!chain.swap_enable) ?? []
            );
            toast.success("Network switched");
            // 清理数据
            setQuantity("");
            cleanData();
          },
          (error) => {
            //
            toast.error(`Switch chain failed: ${error.message}`);
          }
        );
    },
    [props.switchChain, chain]
  );

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chain: API.Chain) => {
      //
      if (chain && chain.token_infos?.length > 0) {
        // let tokens = chain.token_infos.filter((chain) => !!chain.swap_enable);

        const tokens = chain.token_infos;

        let token = tokens.find(
          (t: API.TokenInfo) => t.symbol === "USDC" || t.symbol === "USDbC"
        );
        if (!token) token = tokens[0];

        // if (!token || props.token?.symbol === token.symbol) return;

        setTokens(tokens);

        if (!token) return;

        props.switchToken?.(token);
      }
    },
    [props.token?.symbol]
  );

  useEffect(() => {
    //check quantity
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

  const enquirySuccessHandle = (res: any) => {
    if (res.mark_prices) {
      const fee = needCrossChain ? res.fees_from.total : res.fees_from;
      const swapFee = needCrossChain ? res.fees_from.woofi : res.fees_from;
      const bridgeFee = needCrossChain ? res.fees_from.stargate : undefined;
      const dstGasFee = needCrossChain ? res.dst_infos.gas_fee : "0";

      setTransactionInfo({
        fee: fee,
        markPrices: res.mark_prices,
        price: res.price,
        swapFee,
        bridgeFee,
        dstGasFee,
      });
    }
    // set amount
    if (res.route_infos) {
      const amountValue = needCrossChain
        ? res.route_infos.dst.amounts[1]
        : res.route_infos.amounts[1];

      setAmount(
        new Decimal(amountValue)
          .div(Math.pow(10, dst.decimals))
          // .todp(props.token.)
          .toString()
      );
    }

    setWarningMessage("");
    return res;
  };

  const cleanData = (data?: any) => {
    setTransactionInfo({
      fee: "0",
      markPrices: {
        from_token: 0,
        native_token: 0,
      },
      price: 0,
      swapFee: "0",
      bridgeFee: "0",
      dstGasFee: "0",
      ...data,
    });

    // reset input status
    // setInputStatus("default");
    // setHintMessage("");

    setAmount("");
  };

  const enquiryErrorHandle = (error: Error) => {
    if (error.message === "contract call failed") {
      setWarningMessage(
        "Not enough liquidity. Please try again later or use another chain to deposit."
      );
      // Not enough liquidity on the cross-chain bridge. Please try again later or use another chain to deposit.
      // clean previous data
      cleanData();
    } else {
      toast.error(error.message);
      setWarningMessage("");
    }
  };

  const enquiry = () => {
    return Promise.resolve().then(() =>
      props.onEnquiry?.({
        quantity,
        needCrossChain,
        needSwap,
        params: {
          network: dst.network,
          srcToken: props.token?.address,
          srcNetwork: chain?.info.network_infos?.shortName,
          dstToken: dst.address,
          crossChainRouteAddress:
            chain?.info?.network_infos?.woofi_dex_cross_chain_router,
          amount: new Decimal(quantity)
            .mul(10 ** props.token!.decimals)
            .toString(),
          slippage,
        },
      })
    );
  };

  const debouncedEnquiry = useDebouncedCallback(() => {
    queryStart();
    return enquiry()
      .then(enquirySuccessHandle, enquiryErrorHandle)
      .finally(() => {
        queryStop();
      });
  }, 300);

  useEffect(() => {
    // 如果不需要跨链，也不需要swap，不需要询价
    if (!needCrossChain && !needSwap) {
      cleanData({
        price: 1,
      });
      setAmount(quantity);
      return;
    }

    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) {
      cleanData();
      return;
    }

    debouncedEnquiry();
  }, [
    quantity,
    props.onEnquiry,
    needCrossChain,
    needSwap,
    props.token,
    slippage,
    // querying,
  ]);

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
          wooSwapEnabled={enableSwapDeposit ?? false}
        />
      </div>
      <QuantityInput
        tokens={tokens}
        token={props.token}
        quantity={quantity}
        markPrice={
          needCrossChain || needSwap
            ? isNativeToken
              ? transactionInfo.markPrices.native_token
              : transactionInfo.markPrices.from_token
            : 1
        }
        maxAmount={Number(maxAmount)}
        onValueChange={onValueChange}
        status={inputStatus}
        decimals={dst.decimals}
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
          needSwap={needSwap}
          needCrossChain={needCrossChain}
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
          symbolPrice={props.symbolPrice}
          depositFee={depositFee}
        />
      </div>

      {/* <Notice
        needCrossChain={needCrossChain}
        needSwap={needSwap}
        warningMessage={warningMessage}
        onChainChange={onChainChange}
        currentChain={chain}
      /> */}
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
        needCrossChain={needCrossChain}
        needSwap={needSwap}
        warningMessage={warningMessage}
        onChainChange={onChainChange}
      />
    </div>
  );
};
