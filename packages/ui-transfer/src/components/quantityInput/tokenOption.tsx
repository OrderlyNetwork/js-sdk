import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Badge, cn, Flex, Spinner, Text, TokenIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { isYieldBearingAsset } from "../../constants/yieldBearingAssets";
import { useYieldAPY } from "../depositForm/hooks/useYieldAPY";
import { useBalance } from "./useBalance";

interface TokenOptionProps {
  token: API.TokenInfo & {
    label: string;
    value: string;
    insufficientBalance?: boolean;
    balance?: string;
  };
  fetchBalance?: (token: string, decimals: number) => Promise<any>;
  onTokenChange?: (token: API.TokenInfo) => void;
  isActive: boolean;
  index?: number;
  displayType?: "balance" | "vaultBalance";
  open?: boolean;
}

export const TokenOption: React.FC<TokenOptionProps> = (props) => {
  const { token, isActive, displayType, onTokenChange, fetchBalance, open } =
    props;
  const { symbol, precision, insufficientBalance } = token;
  const { balance, loading } = useBalance(token, fetchBalance, open);
  const { apy } = useYieldAPY(symbol);

  const showBalance = typeof fetchBalance === "function";
  const showAPY = isYieldBearingAsset(symbol) && apy !== null;

  const { t } = useTranslation();

  if (displayType === "vaultBalance" && insufficientBalance) {
    return (
      <Flex
        key={symbol}
        itemAlign={"center"}
        justify="between"
        px={2}
        r="base"
        className={cn(
          "group",
          "oui-h-[30px]",
          "oui-text-2xs oui-font-semibold",
          isActive && "oui-bg-base-5",
          props.index !== 0 && "oui-mt-[2px]",
          "oui-cursor-not-allowed",
        )}
      >
        <Flex itemAlign="center" gapX={1}>
          <TokenIcon name={symbol} className="oui-size-[16px] oui-opacity-50" />
          <Text intensity={36}>{token.label}</Text>
          <Badge color="neutral" size="xs">
            {t("transfer.withdraw.InsufficientVaultBalance")}
          </Badge>
        </Flex>
      </Flex>
    );
  }

  const renderValue = () => {
    if (!showBalance) {
      return null;
    }

    if (loading && !token.balance) {
      return <Spinner size="sm" />;
    }

    return (
      <Text.numeral
        rule="price"
        dp={precision ?? 2}
        rm={Decimal.ROUND_DOWN}
        className={cn(
          "oui-text-base-contrast-80 group-hover:oui-text-base-contrast-54",
          isActive && "oui-text-base-contrast-54",
        )}
      >
        {balance || token.balance!}
      </Text.numeral>
    );
  };

  return (
    <Flex
      key={symbol}
      justify="between"
      px={2}
      r="base"
      className={cn(
        "group",
        "oui-h-[30px] hover:oui-bg-base-5",
        "oui-text-2xs oui-font-semibold",
        "oui-cursor-pointer",
        isActive && "oui-bg-base-5",
        props.index !== 0 && "oui-mt-[2px]",
      )}
      onClick={() => {
        onTokenChange?.(token);
      }}
    >
      <Flex gapX={1} itemAlign="center">
        <TokenIcon name={symbol} className="oui-size-[16px]" />
        <Text
          className={cn(
            "oui-text-base-contrast-54 group-hover:oui-text-base-contrast-80",
            isActive && "oui-text-base-contrast-80",
          )}
        >
          {token.label}
        </Text>
        {showAPY && (
          <div
            style={{
              background: "rgba(0, 180, 158, 0.15)",
              borderRadius: "4px",
              height: "18px",
              paddingLeft: "8px",
              paddingRight: "8px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'DIN 2014', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "18px",
                letterSpacing: "0.36px",
                color: "#00b49e",
                whiteSpace: "nowrap",
              }}
            >
              {apy!.toFixed(1)}% APY
            </span>
          </div>
        )}
      </Flex>
      {renderValue()}
    </Flex>
  );
};
