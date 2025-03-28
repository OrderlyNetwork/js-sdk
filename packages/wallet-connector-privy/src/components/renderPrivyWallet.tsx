import React, { useMemo, useState } from "react";
import { usePrivyWallet } from "../providers/privyWalletProvider";
import { WalletChainTypeEnum, WalletType } from "../types";
import { useWallet } from "../hooks/useWallet";
import { RenderPrivyTypeIcon } from "./common";
import { cn, ExclamationFillIcon } from "@orderly.network/ui";
import { EVMChainPopover, WalletCard } from "./walletCard";
import { ChainNamespace } from "@orderly.network/types";
import { MoreIcon } from "./icons";
import { useWalletConnectorPrivy } from "../provider";

function NoWallet() {
  const {walletChainType} = useWalletConnectorPrivy();
  return (
    <div className="oui-flex oui-flex-col oui-justify-center oui-items-center oui-w-full oui-mt-5">
      <div className="oui-flex oui-flex-col oui-justify-center oui-items-center oui-w-full oui-gap-3">
        <div className="oui-flex oui-flex-col oui-justify-center oui-items-center oui-gap-1 oui-border-[1px] oui-border-line-12 oui-rounded-[8px]  oui-px-2 oui-py-[13px] oui-w-full ">
          <img
            src="https://oss.orderly.network/static/sdk/privy/no-wallet.png"
            className="oui-w-[64px] oui-h-[64px]"
          />
          <div className="oui-text-base-contrast-36 oui-text-2xs oui-font-semibold">
            NO wallet
          </div>
        </div>
        <div className="oui-flex oui-items-start oui-gap-1 oui-px-2 oui-py-[6px] oui-bg-[rgba(232,136,0,0.15)] oui-rounded-[4px] ">
          <ExclamationFillIcon
            size={10}
            className="oui-mt-1 oui-w-[10px] oui-h-[10px] oui-text-warning-darken oui-flex-shrink-0"
          />
          <div className="oui-text-2xs oui-text-warning-darken">
            Please create a wallet to proceed. Only you can access the private
            key. You can export the private key and import your wallet into
            another wallet client, such as MetaMask or Phantom, at any time.
          </div>
        </div>
      </div>
      <div className="oui-h-[1px] oui-bg-line oui-my-5 oui-w-full" />
      <div className="oui-flex oui-flex-col oui-gap-2 oui-w-full">
        {walletChainType === WalletChainTypeEnum.EVM_SOL && (
          <>
            <CreateEVMWallet />
            <CreateSOLWallet />
          </>
        )}
        {walletChainType === WalletChainTypeEnum.onlyEVM && (
          <CreateEVMWallet />
        )}
        {walletChainType === WalletChainTypeEnum.onlySOL && (
          <CreateSOLWallet />
        )}
      </div>
    </div>
  );
}

function CreateEVMWallet() {
  const { createEvmWallet } = usePrivyWallet();
  const [loading, setLoading] = useState(false);
  const doCreate = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    createEvmWallet()
      .then(() => {
        setLoading(false);
      })
      .catch((e: any) => {
        console.warn("createEvmWallet error", e);
        setLoading(false);
      });
  };
  return (
    <div className="oui-bg-[#07080A] oui-rounded-[8px] oui-px-2 oui-py-[11px] oui-w-full">
      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
          <div className="oui-flex oui-items-center oui-justify-start oui-relative oui-w-[55px]">
            <img
              src="https://oss.orderly.network/static/sdk/chains.png"
              className="oui-h-[18px] oui-relative oui-z-0"
            />
            <div className="oui-rounded-full oui-bg-[#282e3a] oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center oui-absolute oui-right-0">
              <EVMChainPopover>
                <MoreIcon
                  className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-h-3 oui-w-3 oui-relative oui-z-10"
                  style={{ zIndex: 1 }}
                />
              </EVMChainPopover>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "oui-text-base-contrast-80 oui-text-2xs oui-font-semibold oui-cursor-pointer",
            loading && "oui-opacity-50"
          )}
          onClick={doCreate}
        >
          Create Evm wallet
        </div>
      </div>
    </div>
  );
}

function CreateSOLWallet() {
  const { createSolanaWallet } = usePrivyWallet();
  const [loading, setLoading] = useState(false);
  const doCreate = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    createSolanaWallet()
      .then(() => {
        setLoading(false);
      })
      .catch((e: any) => {
        console.warn("create solana wallet error", e);
        setLoading(false);
      });
  };
  return (
    <div className="oui-bg-[#07080A] oui-rounded-[8px] oui-px-2 oui-py-[11px] oui-w-full">
      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
        <img
          src="https://oss.orderly.network/static/sdk/solana-logo.png"
          className="oui-w-[15px] oui-h-[15px]"
        />
        <div
          className={cn(
            "oui-text-base-contrast-80 oui-text-2xs oui-font-semibold oui-cursor-pointer",
            loading && "oui-opacity-50"
          )}
          onClick={doCreate}
        >
          Create Solana wallet
        </div>
      </div>
    </div>
  );
}

enum PrivyWalletRenderType {
  onlyEVM = "onlyEVM",
  onlySOL = "onlySOL",
  both = "both",
  noWallet = "noWallet",
}

export function RenderPrivyWallet() {
  const { walletChainType } = useWalletConnectorPrivy();
  const { walletEVM, walletSOL, linkedAccount } = usePrivyWallet();
  const { namespace, switchWallet, disconnect } = useWallet();
  const renderWalletType = useMemo(() => {
    if (walletChainType === WalletChainTypeEnum.onlyEVM) {
      if (walletEVM && walletEVM.accounts.length) {
        return PrivyWalletRenderType.onlyEVM;
      }
      return PrivyWalletRenderType.noWallet;
    }
    if (walletChainType === WalletChainTypeEnum.onlySOL) {
      if (walletSOL && walletSOL.accounts.length) {
        return PrivyWalletRenderType.onlySOL;
      }
      return PrivyWalletRenderType.noWallet;
    }
    if (
      (!walletEVM || !walletEVM.accounts.length) &&
      (!walletSOL || !walletSOL.accounts.length)
    ) {
      return PrivyWalletRenderType.noWallet;
    }
    if (
      walletEVM &&
      walletEVM.accounts.length &&
      (!walletSOL || !walletSOL.accounts.length)
    ) {
      return PrivyWalletRenderType.onlyEVM;
    }
    if (
      (!walletEVM || !walletEVM.accounts.length) &&
      walletSOL &&
      walletSOL.accounts.length
    ) {
      return PrivyWalletRenderType.onlySOL;
    }
    return PrivyWalletRenderType.both;
  }, [walletEVM, walletSOL, walletChainType]);
  return (
    <div>
      <div className="oui-flex oui-justify-between oui-items-center">
        {linkedAccount && (
          <div className="oui-flex oui-items-center oui-justify-start oui-gap-2 oui-text-base-contrast">
            <div>
              <RenderPrivyTypeIcon type={linkedAccount.type} size={24} />
            </div>
            <div className="oui-text-xs">{linkedAccount.address}</div>
          </div>
        )}
        <div
          className="oui-cursor-pointer oui-text-primary oui-text-2xs oui-font-semibold"
          onClick={() => disconnect(WalletType.PRIVY)}
        >
          Log out
        </div>
      </div>
      {renderWalletType === PrivyWalletRenderType.noWallet && <NoWallet />}

      {renderWalletType === PrivyWalletRenderType.both && (
        <div className="oui-flex oui-flex-col oui-gap-5 oui-mt-5">
          {walletChainType === WalletChainTypeEnum.EVM_SOL && (
            <>
              <WalletCard
                type={WalletType.EVM}
                address={walletEVM?.accounts[0].address ?? ""}
                isActive={namespace === ChainNamespace.evm}
                onActiveChange={() => {
                  switchWallet(ChainNamespace.evm);
                }}
                isPrivy={true}
                isBoth={true}
              />
              <WalletCard
                type={WalletType.SOL}
                address={walletSOL?.accounts[0].address ?? ""}
                isActive={namespace === ChainNamespace.solana}
                onActiveChange={() => {
                  switchWallet(ChainNamespace.solana);
                }}
                isPrivy={true}
                isBoth={true}
              />
            </>
          )}
          {walletChainType === WalletChainTypeEnum.onlyEVM && (
            <WalletCard
              type={WalletType.EVM}
              address={walletEVM?.accounts[0].address ?? ""}
              isActive={namespace === ChainNamespace.evm}
              onActiveChange={() => {
                switchWallet(ChainNamespace.evm);
              }}
              isPrivy={true}
              isBoth={false}
            />
          )}
          {walletChainType === WalletChainTypeEnum.onlySOL && (
            <WalletCard
              type={WalletType.SOL}
              address={walletSOL?.accounts[0].address ?? ""}
              isActive={namespace === ChainNamespace.solana}
              onActiveChange={() => {
                switchWallet(ChainNamespace.solana);
              }}
              isPrivy={true}
              isBoth={false}
            />
          )}
        </div>
      )}
      {renderWalletType === PrivyWalletRenderType.onlyEVM && (
        <div className="oui-flex oui-flex-col oui-gap-0 oui-mt-5">
          <WalletCard
            type={WalletType.EVM}
            address={walletEVM?.accounts[0].address ?? ""}
            isActive={namespace === ChainNamespace.evm}
            onActiveChange={() => {
              switchWallet(ChainNamespace.evm);
            }}
            isPrivy={true}
            isBoth={false}
          />
          {walletChainType === WalletChainTypeEnum.EVM_SOL && (
            <>
              <div className="oui-h-[1px] oui-bg-line oui-my-5 oui-w-full" />
              <div className="oui-flex oui-flex-col oui-gap-2 oui-w-full">
                <CreateSOLWallet />
              </div>
            </>
          )}
        </div>
      )}
      {renderWalletType === PrivyWalletRenderType.onlySOL && (
        <div className="oui-flex oui-flex-col oui-gap-0 oui-mt-5">
          <WalletCard
            type={WalletType.SOL}
            address={walletSOL?.accounts[0].address ?? ""}
            isActive={namespace === ChainNamespace.solana}
            onActiveChange={() => {
              switchWallet(ChainNamespace.solana);
            }}
            isPrivy={true}
            isBoth={false}
          />
          {walletChainType === WalletChainTypeEnum.EVM_SOL && (
            <>
              <div className="oui-h-[1px] oui-bg-line oui-my-5 oui-w-full" />
              <div className="oui-flex oui-flex-col oui-gap-2 oui-w-full">
                <CreateEVMWallet />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
