import {useCallback, useMemo, useState} from "react";
import {useChains, useConfig, useWalletConnector, useWithdraw} from "@orderly.network/hooks";
import {ActionType} from "../actionButton";
import { API, NetworkId } from "@orderly.network/types";
import {InputStatus} from "../depositForm/depositForm.script";
import {Decimal, int2hex, praseChainIdToNumber} from "@orderly.network/utils";
import {toast} from "@orderly.network/ui";

export type UseWithdrawFormScriptReturn = ReturnType<typeof useWithdrawForm>


const markPrice = 1;

export const useWithdrawForm = () => {
    const [quantity, setQuantity] = useState<string>("");
    const [token, setToken] = useState<API.TokenInfo>();
    const [inputStatus, setInputStatus] = useState<InputStatus>("default");
    const [hintMessage, setHintMessage] = useState<string>();


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

        return ActionType.Deposit;
    }, []);

    const onQuantityChange = (qty: string) => {
        setQuantity(qty);

    }
    const amount = useMemo(() => {
        return (
            new Decimal(quantity || 0)
                .mul(markPrice)
                // .todp(props.decimals)
                .todp(Math.abs(2 - 5))
                .toString()
        );
    }, [quantity, markPrice]);

    const {dst, withdraw, isLoading, maxAmount, availableBalance, availableWithdraw, unsettledPnL} = useWithdraw();
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
        maxQuantity: '0',
        disabled: false,
        loading: false,
        brokerId: config.get("brokerId"),
        brokerName: config.get("brokerName") || "",
        fee: 0,

        chains,
        currentChain,
        onChainChange,
    }
}