import { FC, ReactNode, useRef, useState } from "react";
import {
  Input,
  InputProps,
  cn,
  Box,
  Text,
  Flex,
  inputFormatter,
  Spinner,
  CaretDownIcon,
  TokenIcon,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  ScrollArea,
} from "@orderly.network/ui";

export type QuantityInputProps = {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  suffix?: ReactNode;
  /** Error message shown below the input; triggers danger border when non-empty. */
  error?: string;
  classNames?: {
    root?: string;
    input?: string;
  };
} & Omit<InputProps, "onClear" | "suffix" | "prefix" | "onValueChange">;

export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const {
    classNames,
    label,
    value,
    onValueChange,
    loading,
    placeholder,
    suffix,
    error,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = !!error;

  const prefix = (
    <Box>
      <Box className="oui-absolute oui-top-1.5">
        <Text size="2xs" intensity={54}>
          {label || "Quantity"}
        </Text>
      </Box>
      {loading && (
        <Box className="oui-absolute oui-bottom-1">
          <Spinner size="sm" />
        </Box>
      )}
    </Box>
  );

  const _placeholder = placeholder ?? (loading ? "" : "0");

  return (
    <Box>
      <Input
        ref={inputRef}
        autoComplete="off"
        placeholder={_placeholder}
        color={hasError ? "danger" : "default"}
        prefix={prefix}
        suffix={suffix}
        value={value}
        onValueChange={(value) => {
          onValueChange?.(value);
        }}
        formatters={[
          inputFormatter.numberFormatter,
          inputFormatter.dpFormatter(2),
          inputFormatter.currencyFormatter,
        ]}
        {...rest}
        classNames={{
          ...classNames,
          root: cn(
            "oui-relative oui-h-[54px] oui-px-3",
            "oui-rounded-lg oui-border oui-border-line",
            props.readOnly
              ? "oui-border-none oui-bg-base-6 focus-within:oui-outline-0"
              : "oui-bg-base-5",
            classNames?.root,
          ),
          input: cn(
            "oui-absolute oui-top-[25px] oui-h-[20px]",
            classNames?.input,
          ),
        }}
      />
      {hasError && (
        <Text size="2xs" className="oui-mt-1 oui-px-1 oui-text-danger">
          {error}
        </Text>
      )}
    </Box>
  );
};

// ─── Currency suffix with dropdown ───────────────────────────────────────────

type CurrencySuffixProps = {
  currencies: readonly string[];
  selected: string;
  onSelect: (currency: string) => void;
};

export const CurrencySuffix: FC<CurrencySuffixProps> = ({
  currencies,
  selected,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const selectable = currencies.length > 1;

  const trigger = (
    <Flex
      itemAlign="center"
      gap={1}
      className={cn(selectable && "oui-cursor-pointer")}
    >
      <img
        src={`https://cdn.onramper.com/icons/tokens/${selected.toLowerCase()}.svg`}
        alt={selected}
        className="oui-size-4 oui-rounded-full"
      />
      <Text size="sm" intensity={80} weight="semibold">
        {selected}
      </Text>
      {selectable && (
        <CaretDownIcon
          size={10}
          className="oui-text-base-contrast-54"
          opacity={1}
        />
      )}
    </Flex>
  );

  return (
    <div className="oui-absolute oui-right-3 oui-flex oui-h-[20px] oui-items-center">
      {selectable ? (
        <DropdownMenuRoot open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="end"
              sideOffset={2}
              className={cn(
                "oui-z-50 oui-bg-base-8 oui-p-1",
                "oui-min-w-[80px]",
                "oui-select-none oui-rounded-md",
              )}
            >
              <ScrollArea>
                <div className="oui-max-h-[110px]">
                  {currencies.map((currency) => {
                    const isActive = currency === selected;
                    return (
                      <Flex
                        key={currency}
                        px={2}
                        r="base"
                        justify="between"
                        itemAlign="center"
                        className={cn(
                          "oui-h-[30px] oui-cursor-pointer hover:oui-bg-base-5",
                          isActive && "oui-bg-base-5",
                          "oui-mt-[2px]",
                        )}
                        onClick={() => {
                          setOpen(false);
                          onSelect(currency);
                        }}
                      >
                        <Flex gap={2} itemAlign="center">
                          <img
                            src={`https://cdn.onramper.com/icons/tokens/${currency.toLowerCase()}.svg`}
                            alt={currency}
                            className="oui-size-4 oui-rounded-full"
                          />
                          <Text size="2xs" intensity={isActive ? 80 : 54}>
                            {currency}
                          </Text>
                        </Flex>
                      </Flex>
                    );
                  })}
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      ) : (
        trigger
      )}
    </div>
  );
};

// ─── Token suffix (read-only, no dropdown) ───────────────────────────────────

type TokenSuffixProps = {
  symbol: string;
};

export const TokenSuffix: FC<TokenSuffixProps> = ({ symbol }) => {
  return (
    <div className="oui-absolute oui-right-3 oui-flex oui-h-[20px] oui-items-center">
      <Flex itemAlign="center" gap={1}>
        <TokenIcon name={symbol} size="xs" />
        <Text size="sm" intensity={80} weight="semibold">
          {symbol}
        </Text>
      </Flex>
    </div>
  );
};
