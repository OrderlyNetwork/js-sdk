import { useCallback, useContext } from "react";
import { useBoolean } from "../useBoolean";
import { useAccountInstance } from "../useAccountInstance";
import { utils } from "@orderly.network/core";
import { pick } from "ramda";
import { OrderlyContext } from "../orderlyContext";

const woofiDexDepositorAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fromAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minToAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "orderlyNativeFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "accountId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "brokerHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "tokenHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "tokenAmount",
        type: "uint128",
      },
    ],
    name: "WOOFiDexSwap",
    type: "event",
  },
  {
    inputs: [],
    name: "NATIVE_PLACEHOLDER",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "stuckToken", type: "address" }],
    name: "inCaseTokenGotStuck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_wooRouter", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "orderlyFeeToggle",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_orderlyFeeToggle", type: "bool" }],
    name: "setOrderlyFeeToggle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "woofiDexVault", type: "address" },
    ],
    name: "setWOOFiDexVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_wooRouter", type: "address" }],
    name: "setWooRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "to", type: "address" },
      {
        components: [
          { internalType: "address", name: "fromToken", type: "address" },
          { internalType: "uint256", name: "fromAmount", type: "uint256" },
          { internalType: "address", name: "toToken", type: "address" },
          { internalType: "uint256", name: "minToAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "orderlyNativeFees",
            type: "uint256",
          },
        ],
        internalType: "struct IWOOFiDexDepositor.Infos",
        name: "infos",
        type: "tuple",
      },
      {
        components: [
          { internalType: "bytes32", name: "accountId", type: "bytes32" },
          { internalType: "bytes32", name: "brokerHash", type: "bytes32" },
          { internalType: "bytes32", name: "tokenHash", type: "bytes32" },
        ],
        internalType: "struct IWOOFiDexDepositor.VaultDeposit",
        name: "vaultDeposit",
        type: "tuple",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wooRouter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "woofiDexVaults",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

export const useSwap = () => {
  const [loading, { setTrue: start, setFalse: stop }] = useBoolean(false);
  const account = useAccountInstance();
  const { configStore } = useContext(OrderlyContext);

  const dstValutDeposit = useCallback(() => {
    return {
      accountId: account.accountIdHashStr,
      brokerHash: utils.parseBrokerHash(configStore.get("brokerId")!),
      tokenHash: utils.parseTokenHash("USDC"),
    };
  }, [account]);

  const swap = useCallback(
    async (
      woofiDexDepositorAdress: string,
      inputs: {
        fromToken: string;
        fromAmount: string;
        toToken: string;
        minToAmount: string;
        orderlyNativeFees: bigint;
      }
    ) => {
      if (!account.walletClient) {
        throw new Error("walletClient is undefined");
      }

      if (!account.address) {
        throw new Error("account.address is undefined");
      }

      if (loading) return;
      start();

      console.log("---------", inputs);

      try {
        // const result = await account.walletClient!.call(
        //   // woofiDexDepositorAdress,
        //   woofiDexDepositorAdress,
        //   "swap",
        //   [account.address, inputs, dstValutDeposit()],
        //   {
        //     abi: woofiDexDepositorAbi,
        //   }
        // );

        const result = await account.walletClient.sendTransaction(
          woofiDexDepositorAdress,
          "swap",
          {
            from: account.address,
            to: woofiDexDepositorAdress,
            data: [account.address, inputs, dstValutDeposit()],
          },
          {
            abi: woofiDexDepositorAbi,
          }
        );

        stop();

        return pick(["from", "to", "hash", "value"], result);
      } catch (e: any) {
        console.log("调用合约报错：", e);

        throw new Error(e.errorCode);
      }
    },
    [loading, account]
  );

  return {
    swap,
    loading,
  };
};
