import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Input, Select, InputProps, cn, Box, Text } from "@orderly.network/ui";

export type TokenInputProps = {
  tokens: string[];
  label?: string;
} & Omit<InputProps, "onClear" | "suffix">;

export const TokenInput = forwardRef<HTMLInputElement, TokenInputProps>(
  (props, ref) => {
    const { tokens, classNames, label, ...rest } = props;

    const [token, setToken] = useState(tokens[0]);

    useEffect(() => {
      setToken(tokens[0]);
    }, [tokens]);

    const tokenOptions = useMemo(() => {
      return props.tokens.map((token) => ({
        name: token,
      }));
    }, [props.tokens]);

    const inputRef = useRef<HTMLInputElement>(null);

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
          value={token}
          size={rest.size}
          onValueChange={(value) => setToken(value)}
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

    return (
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
        {...rest}
        classNames={{
          ...classNames,
          root: cn(
            "oui-h-[54px] oui-relative oui-px-3",
            "oui-bg-base-5 oui-rounded-lg",
            "oui-border oui-border-line",
            "focus-within:oui-outline-transparent",
            classNames?.root
          ),
          input: cn("oui-absolute oui-bottom-0", classNames?.input),
        }}
      />
    );
  }
);
