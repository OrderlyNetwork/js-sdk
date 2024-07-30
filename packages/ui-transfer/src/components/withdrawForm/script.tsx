import {useCallback, useEffect, useMemo, useState} from "react";
import {
    useAccount,
    useChains,
    useConfig,
    usePositionStream,
    useWalletConnector,
    useWithdraw
} from "@orderly.network/hooks";
import {ActionType} from "../actionButton";
import { API, NetworkId } from "@orderly.network/types";
import {InputStatus} from "../depositForm/depositForm.script";
import {Decimal, int2hex, praseChainIdToNumber} from "@orderly.network/utils";
import {toast} from "@orderly.network/ui";
import {useAppContext} from "@orderly.network/react-app";

export type UseWithdrawFormScriptReturn = ReturnType<typeof useWithdrawForm>


const markPrice = 1;

export const useWithdrawForm = () => {
    const [positionData] = usePositionStream();

    const [quantity, setQuantity] = useState<string>("");
    const [token, setToken] = useState<API.TokenInfo>({
        symbol: "USDC",
        decimals: 6,
        address:'',
        display_name:'',
        precision:6,
    });
    const [inputStatus, setInputStatus] = useState<InputStatus>("default");
    const [hintMessage, setHintMessage] = useState<string>();
    const { wrongNetwork } = useAppContext();
    const { account} = useAccount();


    const {
        connectedChain,
        wallet,
        setChain: switchChain,
        settingChain,
    } = useWalletConnector();
    const config = useConfig();
    const { walletName, address } = useMemo(
        () => ({
            walletName: wallet?.label,
            address: wallet?.accounts?.[0].address,
        }),
        [wallet]
    );
    const actionType = useMemo(() => {

        // const qty = Number(quantity);
        // const maxQty = Number(maxQuantity);
        //
        // if (allowanceNum < qty && qty <= maxQty) {
        //     return ActionType.Increase;
        // }
        if (wrongNetwork) {
            return ActionType.SwitchToArbitrum;
        }

        return ActionType.Withdraw;
    }, []);

    const onQuantityChange = (qty: string) => {
        setQuantity(qty);

    }
    const amount = useMemo(() => {
        return (
            new Decimal(quantity || 0)
                .mul(markPrice)
                .todp(2)
                .toString()
        );
    }, [quantity, markPrice]);

    const {dst, withdraw, isLoading, maxAmount, availableBalance, availableWithdraw, unsettledPnL} = useWithdraw();
    const [disabled, setDisabled] = useState<boolean>(true);

    const networkId = config.get("networkId") as NetworkId;

    const [chains, { findByChainId }] = useChains(networkId, {
        pick: "network_infos",
        filter: (chain: any) =>
            chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    });

    const currentChain = useMemo(() => {
        if (!connectedChain) return null;

        const chainId = praseChainIdToNumber(connectedChain.id);
        const chain = findByChainId(chainId);

        return {
            ...connectedChain,
            id: chainId,
            info: chain!,
        };
    }, [connectedChain, findByChainId]);


    const cleanData = () => {
        setQuantity("");
    };

    const onChainChange = useCallback(
        async (chain: API.NetworkInfos) => {
            const chainInfo = findByChainId(chain.chain_id);

            if (
                !chainInfo ||
                chainInfo.network_infos?.chain_id === currentChain?.id
            ) {
                return Promise.resolve();
            }

            return switchChain?.({
                chainId: int2hex(Number(chainInfo.network_infos?.chain_id)),
            })
                .then((switched) => {
                    if (switched) {
                        toast.success("Network switched");
                        // clean input value
                        cleanData();
                    } else {
                        toast.error("Switch chain failed");
                    }
                })
                .catch((error) => {
                    toast.error(`Switch chain failed: ${error.message}`);
                });
        },
        [currentChain, switchChain, findByChainId]
    );

    const hasPositions = useMemo(() =>positionData?.rows?.length! > 0, [positionData]);

    const onSettlePnl = async () => {
        return account
            .settle()
            .catch((e) => {
                if (e.code == -1104) {
                    toast.error(
                        "Settlement is only allowed once every 10 minutes. Please try again later."
                    );
                }
                if (e.message.indexOf('user rejected') !== -1) {
                    toast.error('REJECTED_TRANSACTION');
                }
                return Promise.reject(e);
            })
            .then((res) => {
                toast.success("Settlement requested");
                return Promise.resolve(res);
            });
    }

    useEffect(() => {
        if (!quantity) {
            setInputStatus('default')
            setHintMessage('');
            setDisabled(true);
            return;
        }
        const qty = new Decimal(quantity ?? 0);


        if (unsettledPnL < 0) {
            if (qty.gt(maxAmount)) {

                setInputStatus('error');
                setHintMessage('Insufficient balance');
                setDisabled(true)
            } else {
                setInputStatus('default')
                setHintMessage('');
                setDisabled(false)
            }
        } else {
            if (qty.gt(maxAmount)) {
                setInputStatus('error');
                setHintMessage('Insufficient balance');
                setDisabled(true);
            } else if (qty.gt(new Decimal(maxAmount).minus(unsettledPnL)) && qty.lessThanOrEqualTo(maxAmount)) {
                setInputStatus("warning");
                setHintMessage("Please settle your balance");
                setDisabled(true);
            }else {
                setInputStatus('default')
                setHintMessage('');
                setDisabled(false);
            }
        }

    }, [quantity, maxAmount, unsettledPnL]);


    return {
        walletName,
        actionType,
        address,
        quantity,
        onQuantityChange,
        token,
        inputStatus,
        hintMessage,
        dst,
        amount,
        balanceRevalidating: false,
        maxQuantity: maxAmount,
        disabled,
        loading: false,
        brokerId: config.get("brokerId"),
        brokerName: config.get("brokerName") || "",
        fee: 0,
        hasPositions,
        unsettledPnL,
        wrongNetwork,
        settingChain,
        chains,
        currentChain,
        onChainChange,
        onSettlePnl,
    }
}