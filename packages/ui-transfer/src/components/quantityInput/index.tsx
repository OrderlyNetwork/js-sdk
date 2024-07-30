import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  Input,
  Select,
  InputProps,
  cn,
  Box,
  Text,
  Flex,
  inputFormatter,
} from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { TokenOption } from "./tokenOption";
import { Decimal } from "@orderly.network/utils";

export type InputStatus = "error" | "warning" | "success" | "default";

export type QuantityInputProps = {
  token?: API.TokenInfo;
  tokens?: API.TokenInfo[];
  label?: string;
  status?: InputStatus;
  hintMessage?: string;
  onValueChange?: (value: string) => void;
  onTokenChange?: (token: API.TokenInfo) => void;
  fetchBalance?: (token: string, decimals: number) => Promise<any>;
} & Omit<InputProps, "onClear" | "suffix" | "onValueChange">;

export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  (props, ref) => {
    const {
      token,
      tokens = [],
      classNames,
      label,
      status,
      hintMessage,
      onValueChange,
      onTokenChange,
      fetchBalance,
      value,
      ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState(0);

    const tokenOptions = useMemo(() => {
      return tokens!.map((token) => ({
        ...token,
        name: token.display_name || token.symbol,
      }));
    }, [tokens]);

    useEffect(() => {
      const rect = inputRef?.current?.getBoundingClientRect();
      setWidth(rect?.width || 0);
    }, [inputRef]);

    const _onTokenChange = (value: string) => {
      const find = tokens!.find((item) => item.symbol === value);
      if (find) {
        onTokenChange?.(find);
      }
    };

    const optionRenderer = (item: any) => {
      const isActive = item.symbol === token?.symbol;
      return (
        <TokenOption
          token={item}
          fetchBalance={fetchBalance}
          onTokenChange={(item) => {
            onTokenChange?.(item);
            setOpen(false);
          }}
          isActive={isActive}
        />
      );
    };

    const prefix = (
      <Box className=" oui-absolute oui-top-0">
        <Text size="2xs" intensity={36}>
          {label || "Quantity"}
        </Text>
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
            status === "warning" && "oui-bg-warning-light"
          )}
        ></Box>
        <Text
          size="2xs"
          className={cn(
            status === "error" && "oui-text-danger-light",
            status === "warning" && "oui-text-warning-light"
          )}
        >
          {hintMessage}
        </Text>
      </Flex>
    );

    return (
      <>
        <Input
          ref={inputRef}
          autoComplete="off"
          placeholder="0"
          prefix={prefix}
          suffix={suffix}
          value={value}
          onValueChange={(value) => {
            props.onValueChange?.(value);
          }}
          formatters={[
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(token?.precision ?? 2, {
              roundingMode: Decimal.ROUND_DOWN,
            }),
            inputFormatter.currencyFormatter,
          ]}
          {...rest}
          classNames={{
            ...classNames,
            root: cn(
              "oui-h-[54px] oui-relative oui-px-3",
              "oui-bg-base-5 oui-rounded-lg",
              "oui-border oui-border-line",
              status === "error" && "focus-within:oui-outline-danger-light",
              status === "warning" && "focus-within:oui-outline-warning-light",
              classNames?.root
            ),
            input: cn("oui-absolute oui-bottom-0", classNames?.input),
          }}
        />
        {hintMessage && message}
      </>
    );
  }
);
