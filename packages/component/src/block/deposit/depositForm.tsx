import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/deposit/sections/summary";
import { NetworkImage } from "@/icon/networkImage";
import { useQuery } from "@orderly.network/hooks";

import { MoveDownIcon } from "@/icon";
import { ActionButton } from "./sections/actionButton";
import { InputStatus } from "../quantityInput/quantityInput";
import { Decimal, int2hex } from "@orderly.network/utils";
import { chainsMap } from "@orderly.network/types";
import { toast } from "@/toast";
import { type API } from "@orderly.network/types";

export interface DepositFormProps {
  decimals: number;
  // status?: WithdrawStatus;
  // chains?: API.ChainDetail[];
  chain: any | null;

  token?: API.TokenInfo;

  address?: string;
  walletName?: string;
  minAmount: number;
  maxAmount: string;

  allowance: string;

  balanceRevalidating: boolean;
  settingChain?: boolean;

  switchChain: (options: {
    chainId: string;
    [key: string]: any;
  }) => Promise<any>;

  switchToken?: (token: API.TokenInfo) => void;

  fetchBalances?: (tokens: API.TokenInfo[]) => Promise<any>;
  fetchBalance: (token: string) => Promise<any>;

  onEnquiry?: (inputs: any) => Promise<any>;

  approve: (amount: string | undefined) => Promise<any>;
  deposit: (amount: string) => Promise<any>;

  onOk?: (data: any) => void;
}

const numberReg = /^([0-9]{1,}[.]?[0-9]*)/;

export const DepositForm: FC<DepositFormProps> = (props) => {
  const {
    decimals,
    minAmount,
    maxAmount,
    walletName,
    address,
    // chains,
    chain,
    switchChain,
    onOk,
  } = props;

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [needCrossChain, setNeedCrossChain] = useState<boolean>(false);
  const [needSwap, setNeedSwap] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);

  const [quantity, setQuantity] = useState<string>("");

  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const { data: orderlyChains, error: tokenError } =
    useQuery<API.Chain[]>("/v1/public/token");

  const chainInfo = useMemo(() => {
    if (chain) {
      return chainsMap.get(chain?.id);
    }
  }, [chain]);

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    return Promise.resolve().then(() => {
      if (isNaN(num) || num <= 0) {
        toast.error("Please input a valid number");
        return;
      }

      if (inputStatus !== "default") {
        return;
      }

      if (submitting) return;

      setSubmitting(true);

      return props
        .deposit?.(quantity)
        .then(
          (res: any) => {
            setQuantity("");
            toast.success("Deposit request sent successfully");
            onOk?.(res);
          },
          (error) => {
            toast.error(error?.errorCode);
          }
        )
        .finally(() => {
          setSubmitting(false);
        });
    });
  }, [quantity, maxAmount, submitting]);

  const onApprove = useCallback(() => {
    return props.approve(quantity || undefined);
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

  const onChainChange = useCallback(
    (chain: API.Chain) => {
      // console.log(chain);
      return props
        .switchChain?.({
          chainId: int2hex(Number(chain.network_infos.chain_id)),
          rpcUrl: chain.network_infos.public_rpc_url,
          token: chain.network_infos.currency_symbol,
          // name: chain.network_infos.name,
          label: chain.network_infos.name,

          // blockExplorerUrls: chain.network_infos.explorer_base_url,
        })
        .then(() => {
          // 切换成功后，设置token列表及把list[0]设置为当前token
          setTokens(chain?.token_infos ?? []);
          // if (chain?.token_infos?.length > 0) {
          //   props.switchToken?.(chain.token_infos[0]);
          // }
        });
    },
    [props.switchChain]
  );

  const onChainInited = useCallback(
    (chain: API.Chain) => {
      // console.log("??????", chain);
      if (chain && chain.token_infos?.length > 0) {
        let token = chain.token_infos.find(
          (t: API.TokenInfo) => t.symbol === "USDC"
        );
        if (!token) token = chain.token_infos[0];

        if (!token || props.token?.symbol === token.symbol) return;

        setTokens(chain.token_infos);
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

  useEffect(() => {
    if (!props.token || !chain) return;
    /// check if need swap

    if (props.token.symbol !== "USDC") {
      setNeedSwap(true);
    }

    const tokenItem = orderlyChains?.find(
      (item: any) => item.token === props.token?.symbol
    );
    const tokenChains = tokenItem?.chain_details ?? [];

    /// check if need cross chain
    if (
      tokenChains.findIndex(
        (chain: any) => Number(chain.chain_id) === chain?.id
      ) < 0
    ) {
      setNeedCrossChain(true);
    }
  }, [props.token?.symbol, chain?.id, orderlyChains]);

  useEffect(() => {
    console.log("DepositForm", {
      token: props.token,
      chain,
      needCrossChain,
      needSwap,
    });

    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) return;

    props.onEnquiry?.({ quantity, needCrossChain, needSwap }).then((res) => {
      console.log(res);
    });
  }, [quantity, props.onEnquiry, needCrossChain, needSwap]);

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
      <div className="pb-2">
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
        maxAmount={Number(maxAmount)}
        onValueChange={onValueChange}
        status={inputStatus}
        decimals={decimals}
        hintMessage={hintMessage}
        fetchBalance={props.fetchBalance}
        onTokenChange={props.switchToken}
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
      <Summary needSwap={needSwap} />
      <ActionButton
        chain={chain}
        // chains={chains}
        chainInfo={chainInfo}
        onDeposit={onDeposit}
        allowance={props.allowance}
        disabled={!quantity}
        switchChain={switchChain}
        loading={submitting}
        quantity={quantity}
        onApprove={onApprove}
        submitting={submitting}
        maxQuantity={maxAmount}
      />
    </div>
  );
};
