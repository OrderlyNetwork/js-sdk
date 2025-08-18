import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Text,
  cn,
  Button,
  ArrowRightUpSquareFillIcon,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { VaultCardScript } from "./vaultCard.script";

export const VaultCard: FC<VaultCardScript> = (props) => {
  const {
    title,
    vaultInfo,
    lpInfo,
    description,
    isEVMConnected,
    openDepositAndWithdraw,
    availableBalance,
    openVaultWebsite,
  } = props;

  const { t } = useTranslation();

  const supportVaultsList = useMemo(() => {
    return (
      <div className="oui-flex oui-items-center">
        {vaultInfo.supported_chains.map((chain, index) => (
          <img
            key={chain.chain_id}
            src={`https://oss.orderly.network/static/network_logo/${chain.chain_id}.png`}
            alt={chain.chain_id}
            className="oui-relative oui-size-5"
            style={{
              marginLeft: index > 0 ? "-4px" : "0",
              zIndex: vaultInfo.supported_chains.length - index,
            }}
          />
        ))}
      </div>
    );
  }, [vaultInfo.supported_chains]);

  return (
    <div
      style={{
        height: "388px",
      }}
      className="oui-relative oui-h-[388px] oui-overflow-hidden oui-rounded-2xl oui-bg-base-9"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "180px",
          backdropFilter: "blur(2px)",
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(44, 5, 69, 0.80) 0%, rgba(19, 21, 25, 0.80) 63.46%, #131519 100%)",
        }}
      ></div>
      <img
        src="/vaults/orderly_vault_card_bg.png"
        alt=""
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "180px",
          zIndex: 0,
        }}
      />

      <div className="oui-absolute oui-left-0 oui-top-0 oui-z-20 oui-flex oui-flex-col oui-gap-3  oui-p-6">
        <div className="oui-flex oui-items-center oui-gap-2">
          <img
            src="https://oss.orderly.network/static/symbol_logo/ORDER.png"
            alt=""
            className="oui-size-8"
          />
          <div className="oui-text-[18px] oui-font-semibold oui-text-white">
            {title}
          </div>
          {supportVaultsList}
          <div
            className="oui-z-50 oui-ml-auto oui-cursor-pointer"
            onClick={openVaultWebsite}
          >
            <ArrowRightUpSquareFillIcon
              color="white"
              width={18}
              height={18}
              viewBox="0 0 18 18"
            />
          </div>
        </div>

        <div className="oui-text-2xs oui-font-normal oui-leading-[18px] oui-text-base-contrast-54">
          {description}
        </div>

        <div className="oui-flex oui-items-center oui-gap-2">
          <VaultInfoItem
            label={t("vaults.card.tvl")}
            value={vaultInfo.tvl}
            textProps={{
              currency: "$",
              dp: 0,
              type: "numeral",
            }}
          />
          <VaultInfoItem
            label={t("vaults.card.apy")}
            value={(vaultInfo["30d_apy"] * 100).toFixed(2) + "%"}
            textProps={{
              color: "brand",
              type: "gradient",
            }}
          />
        </div>

        <div className="oui-mt-3 oui-flex oui-flex-col oui-items-center oui-gap-2 oui-rounded-lg oui-bg-white/[0.06] oui-p-3">
          <LpInfoItem
            label={t("vaults.card.myDeposits")}
            value={lpInfo.deposits}
          />
          <LpInfoItem
            label={t("vaults.card.myEarnings")}
            value={lpInfo.earnings}
          />
        </div>

        <LpInfoItem
          label={t("vaults.card.accountBalance")}
          value={availableBalance}
        />

        <VaultCardOperation
          isEVMConnected={isEVMConnected}
          openDepositAndWithdraw={openDepositAndWithdraw}
        />
      </div>
    </div>
  );
};

const VaultInfoItem: FC<{
  label: string;
  value: string | number;
  textProps?: any;
}> = (props) => {
  const { label, value, textProps } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-flex-1 oui-flex-col oui-items-center oui-justify-center oui-px-3 oui-py-2",
        "oui-rounded-lg oui-border oui-border-solid oui-border-white/[0.12]",
      )}
    >
      <div className="oui-text-2xs oui-font-normal oui-leading-[18px] oui-text-base-contrast-54">
        {label}
      </div>
      {textProps.type === "gradient" ? (
        <Text.gradient
          className="oui-text-base oui-font-semibold"
          {...textProps}
        >
          {value}
        </Text.gradient>
      ) : (
        <Text.numeral
          className="oui-text-base oui-font-semibold"
          {...textProps}
        >
          {value}
        </Text.numeral>
      )}
    </div>
  );
};

const LpInfoItem: FC<{
  label: string;
  value: string | number;
  textProps?: any;
}> = (props) => {
  const { label, value, textProps } = props;

  return (
    <div className="oui-flex oui-w-full oui-items-center oui-justify-between oui-text-2xs oui-font-normal">
      <div className="oui-text-base-contrast-54">{label}</div>
      <Text.numeral
        className="oui-text-base-contrast-80"
        {...textProps}
        dp={2}
        suffix={
          <span className="oui-ml-1 oui-text-base-contrast-36">USDC</span>
        }
      >
        {value}
      </Text.numeral>
    </div>
  );
};

type VaultCardOperationProps = {
  isEVMConnected: boolean;
  openDepositAndWithdraw: (activeTab: "deposit" | "withdraw") => void;
};

const VaultCardOperation: FC<VaultCardOperationProps> = (props) => {
  const { isEVMConnected, openDepositAndWithdraw } = props;
  const { t } = useTranslation();

  return (
    <AuthGuard buttonProps={{ size: "md", fullWidth: true }}>
      {isEVMConnected ? (
        <div className="oui-flex oui-items-center oui-gap-2">
          <Button
            className="oui-flex-1"
            size="md"
            onClick={() => openDepositAndWithdraw("deposit")}
          >
            {t("common.deposit")}
          </Button>
          <Button
            className="oui-flex-1"
            size="md"
            color="secondary"
            onClick={() => openDepositAndWithdraw("withdraw")}
          >
            {t("common.withdraw")}
          </Button>
        </div>
      ) : (
        <Button size="md" color="warning">
          {t("connector.wrongNetwork")}
        </Button>
      )}
    </AuthGuard>
  );
};
