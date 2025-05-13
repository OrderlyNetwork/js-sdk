import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStorageChain } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AbstractChains, ChainNamespace } from "@orderly.network/types";
import { cn, ExclamationFillIcon } from "@orderly.network/ui";
import { windowGuard } from "@orderly.network/utils";
import { useWallet } from "../hooks/useWallet";
import { useWalletConnectorPrivy } from "../provider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { WalletChainTypeEnum, WalletConnectType, WalletType } from "../types";
import { RenderPrivyTypeIcon } from "./common";
import { MoreIcon } from "./icons";
import { EVMChainPopover, WalletCard } from "./walletCard";

function NoWallet() {
  const { walletChainType } = useWalletConnectorPrivy();
  const { t } = useTranslation();
  return (
    <div className="oui-mt-5 oui-flex oui-w-full oui-flex-col oui-items-center oui-justify-center">
      <div className="oui-flex oui-w-full oui-flex-col oui-items-center oui-justify-center oui-gap-3">
        <div className="oui-flex oui-w-full oui-flex-col oui-items-center oui-justify-center oui-gap-1 oui-rounded-[8px] oui-border  oui-border-line-12 oui-px-2 oui-py-[13px] ">
          <img
            src="https://oss.orderly.network/static/sdk/privy/no-wallet.png"
            className="oui-size-[64px]"
          />
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
            {t("connector.privy.noWallet")}
          </div>
        </div>
        <div className="oui-flex oui-items-start oui-gap-1 oui-rounded-[4px] oui-bg-[rgba(232,136,0,0.15)] oui-px-2 oui-py-[6px] ">
          <ExclamationFillIcon
            size={10}
            className="oui-mt-1 oui-size-[10px] oui-shrink-0 oui-text-warning-darken"
          />
          <div className="oui-text-2xs oui-text-warning-darken">
            {t("connector.privy.noWallet.description")}
          </div>
        </div>
      </div>
      <div className="oui-my-5 oui-h-px oui-w-full oui-bg-line" />
      <div className="oui-flex oui-w-full oui-flex-col oui-gap-2">
        {walletChainType === WalletChainTypeEnum.EVM_SOL && (
          <>
            <CreateEVMWallet />
            <CreateSOLWallet />
          </>
        )}
        {walletChainType === WalletChainTypeEnum.onlyEVM && <CreateEVMWallet />}
        {walletChainType === WalletChainTypeEnum.onlySOL && <CreateSOLWallet />}
      </div>
    </div>
  );
}

function CreateEVMWallet() {
  const { t } = useTranslation();
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
    <div className="oui-w-full oui-rounded-[8px] oui-bg-[#07080A] oui-px-2 oui-py-[11px]">
      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
          <div className="oui-relative oui-flex oui-w-[55px] oui-items-center oui-justify-start">
            <img
              src="https://oss.orderly.network/static/sdk/chains.png"
              className="oui-relative oui-z-0 oui-h-[18px]"
            />
            <div className="oui-absolute oui-right-0 oui-flex oui-size-[18px] oui-items-center oui-justify-center oui-rounded-full oui-bg-[#282e3a]">
              <EVMChainPopover>
                <MoreIcon
                  className="oui-relative oui-z-10 oui-size-3 oui-text-base-contrast-54 hover:oui-text-base-contrast"
                  style={{ zIndex: 1 }}
                />
              </EVMChainPopover>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "oui-cursor-pointer oui-text-2xs oui-font-semibold oui-text-base-contrast-80",
            loading && "oui-opacity-50",
          )}
          onClick={doCreate}
        >
          {t("connector.privy.createEvmWallet")}
        </div>
      </div>
    </div>
  );
}

function CreateSOLWallet() {
  const { t } = useTranslation();
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
    <div className="oui-w-full oui-rounded-[8px] oui-bg-[#07080A] oui-px-2 oui-py-[11px]">
      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
        <img
          src="https://oss.orderly.network/static/sdk/solana-logo.png"
          className="oui-size-[15px]"
        />
        <div
          className={cn(
            "oui-cursor-pointer oui-text-2xs oui-font-semibold oui-text-base-contrast-80",
            loading && "oui-opacity-50",
          )}
          onClick={doCreate}
        >
          {t("connector.privy.createSolanaWallet")}
        </div>
      </div>
    </div>
  );
}
interface ConnectWallet {
  type: WalletType;
  address: string;
}

export function RenderPrivyWallet() {
  const { t } = useTranslation();
  const {
    targetWalletType,
    setTargetWalletType,
    walletChainTypeConfig,
    connectorWalletType,
  } = useWalletConnectorPrivy();
  const { walletEVM, walletSOL, linkedAccount } = usePrivyWallet();
  const { namespace, switchWallet, disconnect } = useWallet();
  const { storageChain } = useStorageChain();
  const [walletList, setWalletList] = useState<ConnectWallet[]>([]);
  const [addWallet, setAddWallet] = useState<React.ReactNode[]>([]);
  const [loading, setLoading] = useState(true);

  const isActive = useCallback(
    (walletType: WalletType) => {
      if (storageChain?.namespace === ChainNamespace.evm) {
        if (walletType === WalletType.EVM) {
          return !AbstractChains.has(storageChain?.chainId);
        }
        return false;
      }
      if (storageChain?.namespace === ChainNamespace.solana) {
        return walletType === WalletType.SOL;
      }
      return false;
    },
    [storageChain],
  );

  const isHaveEvmWallet = useMemo(() => {
    return walletEVM && walletEVM.accounts.length;
  }, [walletEVM]);

  const isHaveSolWallet = useMemo(() => {
    return walletSOL && walletSOL.accounts.length;
  }, [walletSOL]);

  const renderWarning = useCallback(() => {
    let showWarning = false;
    if (AbstractChains.has(storageChain?.chainId)) {
      showWarning = true;
    }
    if (targetWalletType === WalletType.ABSTRACT) {
      showWarning = true;
    }
    if (!showWarning) {
      return;
    }
    return (
      <div className="oui-mt-5 oui-border-b oui-border-line oui-pb-5">
        <div
          className={cn(
            "oui-flex oui-items-start oui-justify-center oui-gap-1",
            "oui-w-full  oui-rounded-[8px] oui-px-2 oui-py-[13px]",
            "oui-bg-warning-darken/10",
          )}
        >
          <ExclamationFillIcon
            size={14}
            className="oui-mt-[2px] oui-size-[14px] oui-shrink-0 oui-text-warning-darken"
          />
          <div className="oui-text-2xs oui-leading-[18px] oui-text-warning-darken">
            Abstract Chain access requires Abstract Global Wallet. Privy
            connection is currently unsupported.
          </div>
        </div>
      </div>
    );
    // }
  }, [targetWalletType]);

  const renderWallet = useCallback(() => {
    if (loading) {
      return;
    }
    if (!walletList.length) {
      return <NoWallet />;
    }
    return (
      <div className="oui-mt-5 oui-flex oui-flex-col oui-gap-5">
        {walletList.map((wallet) => (
          <WalletCard
            key={wallet.type}
            type={wallet.type}
            address={wallet.address}
            isActive={isActive(wallet.type)}
            isPrivy={true}
            isMulti={walletList.length > 1}
            onActiveChange={() => {
              switchWallet(wallet.type);
            }}
          />
        ))}
        {addWallet.map((node, index) => (
          <div key={index}>
            <div className="oui-my-5 oui-h-px oui-w-full oui-bg-line" />
            <div className="oui-flex oui-w-full oui-flex-col oui-gap-2">
              {node}
            </div>
          </div>
        ))}
      </div>
    );
  }, [walletList, addWallet, isActive, switchWallet, t, loading]);

  useEffect(() => {
    new Promise((resolve) =>
      setTimeout(() => {
        setLoading(false);
        resolve(true);
      }, 200),
    );
  }, []);

  useEffect(() => {
    const tempWalletList = [];
    const tempAddWallet = [];
    if (!connectorWalletType.disableWagmi && walletChainTypeConfig.hasEvm) {
      if (isHaveEvmWallet) {
        tempWalletList.push({
          type: WalletType.EVM,
          address: walletEVM!.accounts[0].address,
        });
      } else {
        tempAddWallet.push(<CreateEVMWallet />);
      }
    }
    if (!connectorWalletType.disableSolana && walletChainTypeConfig.hasSol) {
      if (isHaveSolWallet) {
        tempWalletList.push({
          type: WalletType.SOL,
          address: walletSOL!.accounts[0].address,
        });
      } else {
        tempAddWallet.push(<CreateSOLWallet />);
      }
    }
    setWalletList(tempWalletList);
    setAddWallet(tempAddWallet);
  }, [
    connectorWalletType,
    walletChainTypeConfig,
    walletEVM,
    walletSOL,
    isHaveEvmWallet,
    isHaveSolWallet,
  ]);

  useEffect(() => {
    if (targetWalletType === WalletType.ABSTRACT) {
      windowGuard(() => {
        setTimeout(() => {
          setTargetWalletType(undefined);
        }, 5000);
      });
    }
  }, [targetWalletType, setTargetWalletType]);

  return (
    <div>
      <div className="oui-flex oui-items-center oui-justify-between">
        {linkedAccount && (
          <div className="oui-flex oui-items-center oui-justify-start oui-gap-2 oui-text-base-contrast">
            <div>
              <RenderPrivyTypeIcon type={linkedAccount.type} size={24} />
            </div>
            <div className="oui-text-xs">{linkedAccount.address}</div>
          </div>
        )}
        <div
          className="oui-cursor-pointer oui-text-2xs oui-font-semibold oui-text-primary"
          onClick={() => disconnect(WalletConnectType.PRIVY)}
        >
          {t("connector.privy.logout")}
        </div>
      </div>
      {renderWarning()}
      {renderWallet()}
    </div>
  );
}
