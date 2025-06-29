import React from "react";
import { API } from "@orderly.network/types";
import { Badge, cn, Flex, Spinner, Text, TokenIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useBalance } from "./useBalance";

interface TokenOptionProps {
  token: API.TokenInfo & {
    label: string;
    value: string;
    insufficientBalance?: boolean;
  };
  fetchBalance?: (token: string, decimals: number) => Promise<any>;
  onTokenChange?: (token: API.TokenInfo) => void;
  isActive: boolean;
  index?: number;
}

export const TokenOption: React.FC<TokenOptionProps> = (props) => {
  const { token, isActive, onTokenChange, fetchBalance } = props;
  const { symbol, precision, insufficientBalance } = token;
  const { balance, loading } = useBalance(token, fetchBalance);

  const showBalance = typeof fetchBalance === "function";

  const dp = precision ?? 2;

  if (insufficientBalance) {
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
          "oui-cursor-pointer",
          isActive && "oui-bg-base-5",
          props.index !== 0 && "oui-mt-[2px]",
          "oui-cursor-not-allowed",
        )}
      >
        <Flex itemAlign="center" gapX={1}>
          <TokenIcon name={symbol} className="oui-size-[16px] oui-opacity-50" />
          <Text intensity={36}>{symbol}</Text>
          <Badge color="neutral" size="xs">
            Insufficient vault balance
          </Badge>
        </Flex>
      </Flex>
    );
  }

  const renderValue = () => {
    if (!showBalance) {
      return null;
    }

    if (loading) {
      return <Spinner size="sm" />;
    }

    return (
      <Text.numeral
        rule="price"
        dp={dp}
        rm={Decimal.ROUND_DOWN}
        className={cn(
          "oui-text-base-contrast-80 group-hover:oui-text-base-contrast-54",
          isActive && "oui-text-base-contrast-54",
        )}
      >
        {balance}
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
      <Flex gapX={1}>
        <TokenIcon name={symbol} className="oui-size-[16px]" />
        <Text
          className={cn(
            "oui-text-base-contrast-54 group-hover:oui-text-base-contrast-80",
            isActive && "oui-text-base-contrast-80",
          )}
        >
          {symbol}
        </Text>
      </Flex>
      {renderValue()}
    </Flex>
  );
};
