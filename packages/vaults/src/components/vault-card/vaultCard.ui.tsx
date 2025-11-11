import { FC, useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Text,
  cn,
  Button,
  ArrowRightUpSquareFillIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  useScreen,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { parseMarkdownLinks } from "../../utils/parseMarkdownLinks";
import { VaultCardScript } from "./vaultCard.script";

export const VaultCard: FC<VaultCardScript> = (props) => {
  const {
    title,
    vaultInfo,
    lpInfo,
    description,
    isEVMConnected,
    isSOLConnected,
    openDepositAndWithdraw,
    availableBalance,
    openVaultWebsite,
    icon,
    isButtonsDisabled,
  } = props;

  const { t } = useTranslation();
  const isPreLaunch = vaultInfo.status === "pre_launch";
  const { isMobile } = useScreen();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Check if description exceeds 3 lines
  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = 18; // oui-leading-[18px]
      const maxHeight = lineHeight * 3;
      const actualHeight = descriptionRef.current.scrollHeight;
      setShowExpandButton(actualHeight > maxHeight);
    }
  }, [description]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const supportVaultsList = useMemo(() => {
    const chains = Array.isArray(vaultInfo?.supported_chains)
      ? vaultInfo.supported_chains
      : [];
    return (
      <div className="oui-flex oui-items-center">
        {chains.map((chain, index) => (
          <img
            key={chain.chain_id}
            src={`https://oss.orderly.network/static/network_logo/${chain.chain_id}.png`}
            alt={chain.chain_id}
            className={cn(
              "oui-relative",
              isMobile ? "oui-size-[18px]" : "oui-size-5",
            )}
            style={{
              marginLeft: index > 0 ? "-4px" : "0",
              zIndex: chains.length - index,
            }}
          />
        ))}
      </div>
    );
  }, [vaultInfo.supported_chains, isMobile]);

  return (
    <div className="oui-relative oui-h-[388px] oui-overflow-hidden oui-rounded-2xl oui-border oui-border-solid oui-border-white/[0.12] oui-bg-base-9">
      <img
        src="/vaults/vaults-card-bg.png"
        alt=""
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "180px",
          objectFit: "cover",
          objectPosition: "top",
          zIndex: 0,
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <div
        className={cn(
          "oui-absolute oui-left-0 oui-top-0 oui-z-20 oui-size-full oui-p-6",
          isExpanded && "oui-overflow-y-auto",
        )}
      >
        <div className="oui-flex oui-flex-col oui-gap-3">
          <div className="oui-flex oui-items-center oui-gap-2">
            <img
              src={icon}
              alt={vaultInfo.broker_id}
              className="oui-size-8"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="oui-text-[18px] oui-font-semibold oui-text-white">
              {title}
            </div>
            {/* {supportVaultsList} */}
            {isPreLaunch && (
              <div
                className="oui-flex oui-items-center oui-gap-[10px] oui-px-2 oui-text-[#E88800]"
                style={{
                  height: "18px",
                  borderRadius: "4px",
                  background: "rgba(232, 136, 0, 0.15)",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "18px",
                  letterSpacing: "0.36px",
                }}
              >
                {t("vaults.card.launchingSoon")}
              </div>
            )}
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
          <div
            className={cn(
              "-oui-mb-1 oui-flex oui-flex-col",
              !isExpanded && "oui-h-[72px]",
            )}
          >
            <div
              ref={descriptionRef}
              className={cn(
                "oui-text-2xs oui-font-normal oui-leading-[18px] oui-text-base-contrast-54",
                !isExpanded && showExpandButton && "oui-line-clamp-3",
              )}
            >
              {parseMarkdownLinks(description)}
            </div>
            {showExpandButton && (
              <button
                onClick={handleToggleExpand}
                className="oui-self-end oui-inline-flex oui-shrink-0 oui-cursor-pointer oui-items-center oui-gap-0.5 oui-text-[12px] oui-font-medium"
                style={{ color: "#608CFF" }}
              >
                {isExpanded ? (
                  <>
                    <span>{t("vaults.card.less")}</span>
                    <ChevronUpIcon
                      size={12}
                      opacity={1}
                      color="inherit"
                      className="oui-translate-y-[0.5px]"
                    />
                  </>
                ) : (
                  <>
                    <span>{t("vaults.card.more")}</span>
                    <ChevronDownIcon
                      size={12}
                      opacity={1}
                      color="inherit"
                      className="oui-translate-y-[0.5px]"
                    />
                  </>
                )}
              </button>
            )}
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
              value={
                vaultInfo["30d_apy"] > 100
                  ? ">10000%"
                  : (vaultInfo["30d_apy"] * 100).toFixed(2) + "%"
              }
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
            isSOLConnected={isSOLConnected}
            openDepositAndWithdraw={openDepositAndWithdraw}
            isButtonsDisabled={isButtonsDisabled}
          />
        </div>
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
  isSOLConnected: boolean;
  openDepositAndWithdraw: (activeTab: "deposit" | "withdraw") => void;
  isButtonsDisabled: boolean;
};

const VaultCardOperation: FC<VaultCardOperationProps> = (props) => {
  const {
    isEVMConnected,
    isSOLConnected,
    openDepositAndWithdraw,
    isButtonsDisabled,
  } = props;
  const { t } = useTranslation();

  return (
    <AuthGuard buttonProps={{ size: "md", fullWidth: true }}>
      {isEVMConnected || isSOLConnected ? (
        <div className="oui-flex oui-items-center oui-gap-2">
          <Button
            className="oui-flex-1"
            size="md"
            disabled={isButtonsDisabled}
            onClick={() => openDepositAndWithdraw("deposit")}
          >
            {t("common.deposit")}
          </Button>
          <Button
            className="oui-flex-1"
            size="md"
            color="secondary"
            disabled={isButtonsDisabled}
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
