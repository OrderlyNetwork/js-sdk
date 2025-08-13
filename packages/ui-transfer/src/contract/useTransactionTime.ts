import { useEffect, useMemo, useRef, useState } from "react";
import { useChains, useWalletConnector } from "@orderly.network/hooks";
import { getBlockTime } from "./getBlockTime";
import { getChainConfirmations } from "./getChainConfirmations";

export const useTransactionTime = (chainId?: number | string) => {
  const [blockTime, setBlockTime] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  const timeMap = useRef<Record<string, number>>({});
  const confirmationsMap = useRef<Record<string, number>>({});

  const [_, { findByChainId }] = useChains();
  const { wallet } = useWalletConnector();

  const chain = useMemo(() => {
    if (!chainId) {
      return;
    }
    const id = typeof chainId === "number" ? chainId : parseInt(chainId);
    return findByChainId(id);
  }, [chainId, findByChainId]);

  useEffect(() => {
    if (!chain || !wallet) {
      return;
    }

    const chainId = chain.network_infos.chain_id;

    if (timeMap.current[chainId]) {
      setBlockTime(timeMap.current[chainId]);
    } else {
      getBlockTime({
        chainId,
        chain,
        wallet,
      })
        .then((time) => {
          console.log("average block time", chainId, time);
          setBlockTime(time);
          // record chain block time
          timeMap.current[chainId] = time;
        })
        .catch((error) => {
          console.error("getBlockTime error", error);
        });
    }

    if (confirmationsMap.current[chainId]) {
      setConfirmations(confirmationsMap.current[chainId]);
    } else {
      getChainConfirmations(chain)
        .then((confirmations) => {
          console.log("confirmations", chainId, confirmations);
          setConfirmations(confirmations);
          // record chain confirmations
          confirmationsMap.current[chainId] = confirmations;
        })
        .catch((error) => {
          console.error("getChainConfirmations error", error);
        });
    }
  }, [chain, wallet]);

  const transactionTime = useMemo(() => {
    if (blockTime && confirmations) {
      return blockTime * confirmations;
    }
    return 0;
  }, [blockTime, confirmations]);

  return transactionTime;
};
