/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
  Input,
  Select,
  InputProps,
  cn,
  Box,
  Text,
  Flex,
  inputFormatter,
  Spinner,
  InputFormatter,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { InputStatus } from "../../types";
import { TokenOption } from "./tokenOption";

export type QuantityInputProps = {
  token?: API.TokenInfo;
  tokens?: API.TokenInfo[];
  label?: string;
  status?: InputStatus;
  hintMessage?: string;
  onValueChange?: (value: string) => void;
  onTokenChange?: (token: API.TokenInfo) => void;
  fetchBalance?: (token: string, decimals: number) => Promise<any>;
  loading?: boolean;
  testId?: string;
  formatters?: InputFormatter[];
  vaultBalanceList?: API.VaultBalance[];
  displayType?: "balance" | "vaultBalance";
} & Omit<InputProps, "onClear" | "suffix" | "onValueChange">;

export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  (props) => {
    const {
      token,
      tokens = [],
      classNames,
      label,
      status,
      hintMessage,
      value,
      onValueChange,
      fetchBalance,
      onTokenChange,
      loading,
      placeholder,
      formatters,
      vaultBalanceList,
      displayType,
      ...rest
    } = props;

    const { t } = useTranslation();

    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState(0);

    const tokenOptions = useMemo(() => {
      return tokens.map((token) => {
        const currentToken = vaultBalanceList?.find(
          (item) => item.token === token.symbol,
        );
        const insufficientBalance = new Decimal(currentToken?.balance ?? 0).lt(
          value ? Number(value) : 0,
        );
        return {
          ...token,
          name: token.display_name || token.symbol!,
          insufficientBalance: insufficientBalance,
        };
      });
    }, [tokens, value, vaultBalanceList]);

    useEffect(() => {
      const rect = inputRef?.current?.getBoundingClientRect();
      setWidth(rect?.width || 0);
    }, [inputRef]);

    const _onTokenChange = (value: string) => {
      const find = tokens.find((item) => item.symbol === value);
      if (find) {
        onTokenChange?.(find);
      }
    };

    const optionRenderer = (item: any) => {
      const isActive = item.symbol === token?.symbol;
      return (
        <TokenOption
          token={item}
          isActive={isActive}
          fetchBalance={fetchBalance}
          displayType={displayType}
          onTokenChange={(item) => {
            onTokenChange?.(item);
            setOpen(false);
          }}
        />
      );
    };

    const prefix = (
      <Box>
        <Box className="oui-absolute oui-top-0">
          <Text size="2xs" intensity={36}>
            {label || t("common.quantity")}
          </Text>
        </Box>
        {loading && (
          <Box className="oui-absolute oui-bottom-1">
            <Spinner size="sm" />
          </Box>
        )}
      </Box>
    );

    const selectable = tokens.length > 1;

    const suffix = (
      <div className="oui-absolute oui-right-0">
        <Select.tokens
          open={selectable ? open : false}
          onOpenChange={setOpen}
          disabled={rest.disabled}
          variant="text"
          tokens={tokenOptions}
          value={token?.display_name || token?.symbol}
          size={rest.size}
          onValueChange={_onTokenChange}
          showIcon
          optionRenderer={optionRenderer}
          contentProps={{
            onCloseAutoFocus: (event) => {
              event.preventDefault();
              inputRef.current?.focus();
            },
            onClick: (event) => {
              event.preventDefault();
              inputRef.current?.focus();
            },
            style: { width },
            align: "end",
            sideOffset: 5,
            className: "oui-border oui-border-line-6",
          }}
        />
      </div>
    );

    const message = (
      <Flex mt={1} gapX={1} px={1}>
        <Box
          width={4}
          height={4}
          r="full"
          className={cn(
            status === "error" && "oui-bg-danger-light",
            status === "warning" && "oui-bg-warning-light",
          )}
        ></Box>
        <Text
          size="2xs"
          className={cn(
            status === "error" && "oui-text-danger-light",
            status === "warning" && "oui-text-warning-light",
          )}
        >
          {hintMessage}
        </Text>
      </Flex>
    );

    const _placeholder = placeholder ?? (loading ? "" : "0");

    return (
      <>
        <Input
          data-testid={props.testId}
          ref={inputRef}
          autoComplete="off"
          placeholder={_placeholder}
          prefix={prefix}
          suffix={suffix}
          value={value}
          onValueChange={(value) => {
            onValueChange?.(value);
          }}
          formatters={
            formatters || [
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(token?.precision ?? 2),
              inputFormatter.currencyFormatter,
            ]
          }
          {...rest}
          classNames={{
            ...classNames,
            root: cn(
              "oui-relative oui-h-[54px] oui-px-3",
              "oui-rounded-lg oui-border oui-border-line",
              status === "error" &&
                "oui-outline-danger-light focus-within:oui-outline-danger-light",
              status === "warning" &&
                "oui-outline-warning-light focus-within:oui-outline-warning-light",
              props.readOnly
                ? "oui-border-none oui-bg-base-6 focus-within:oui-outline-0"
                : "oui-bg-base-5",
              classNames?.root,
            ),
            input: cn("oui-absolute oui-bottom-0", classNames?.input),
          }}
        />
        {hintMessage && message}
      </>
    );
  },
);
