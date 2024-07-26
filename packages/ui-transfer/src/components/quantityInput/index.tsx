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

export type InputStatus = "error" | "warning" | "success" | "default";

export type QuantityInputProps = {
  tokens: API.TokenInfo[];
  label?: string;
  status?: InputStatus;
  hintMessage?: string;
  precision?: number;
  onValueChange?: (value: string) => void;
  onTokenChange?: (token: API.TokenInfo) => void;
} & Omit<InputProps, "onClear" | "suffix" | "onValueChange">;

export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  (props, ref) => {
    const {
      tokens,
      classNames,
      label,
      status,
      hintMessage,
      onValueChange,
      value,
      precision,
      ...rest
    } = props;

    const [token, setToken] = useState<API.TokenInfo>();

    useEffect(() => {
      setToken(tokens[0]);
    }, [tokens]);

    const tokenOptions = useMemo(() => {
      return props.tokens.map((token) => ({
        name: token.symbol,
      }));
    }, [props.tokens]);

    const inputRef = useRef<HTMLInputElement>(null);

    const onTokenChange = (value: string) => {
      const find = props.tokens.find((token) => token.symbol === value);
      if (find) {
        setToken(find);
        props.onTokenChange?.(find);
      }
    };

    const prefix = (
      <Box className=" oui-absolute oui-top-0">
        <Text size="2xs" intensity={54}>
          {label || "Quantity"}
        </Text>
      </Box>
    );

    const suffix = (
      <div className="oui-max-w-fit oui-absolute oui-right-0">
        <Select.tokens
          disabled={rest.disabled}
          variant="text"
          tokens={tokenOptions}
          value={token?.symbol}
          size={rest.size}
          onValueChange={onTokenChange}
          showIcon
          contentProps={{
            align: "end",
            onCloseAutoFocus: (event) => {
              event.preventDefault();
              inputRef.current?.focus();
            },
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
          ref={(node) => {
            // @ts-ignore
            inputRef.current = node;
            if (ref) {
              if (typeof ref === "function") {
                ref(node);
              } else {
                ref.current = node;
              }
            }
          }}
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
            // inputFormatter.dpFormatter({ dp: precision ?? 8 }),
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
        {message}
      </>
    );
  }
);
