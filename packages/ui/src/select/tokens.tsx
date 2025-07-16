import React, { ReactElement, useMemo } from "react";
import {
  ItemIndicator,
  SelectItem,
  SelectItemText,
} from "@radix-ui/react-select";
import { Flex } from "../flex";
import type { SizeType } from "../helpers/sizeType";
import { TokenIcon } from "../icon";
import { Text } from "../typography";
import type { SelectProps } from "./select";
import { selectVariants } from "./selectPrimitive";
import { SelectOption, SelectWithOptions } from "./withOptions";

type TokenItem = {
  name: string;
  [x: string]: any;
};

export type TokenSelectProps = {
  tokens: TokenItem[];
  showIcon?: boolean;
  optionRenderer?: (option: SelectOption) => ReactElement;
} & SelectProps<string>;

export const TokenSelect: React.FC<TokenSelectProps> = (props) => {
  const { tokens, showIcon = true, ...rest } = props;
  const { icon } = selectVariants();

  const options = useMemo(() => {
    return tokens.map((token) => {
      return {
        ...token,
        label: token.name,
        value: token.name,
      };
    });
  }, [tokens]);

  const selectable = options.length > 1;

  const valueRenderer = (value: string) => {
    if (typeof props.valueFormatter === "function") {
      return props.valueFormatter(value, {});
    }
    return (
      <Flex gapX={1}>
        <TokenIcon name={value} className={icon({ size: props.size })} />
        <Text weight="semibold" intensity={54}>
          {value}
        </Text>
      </Flex>
    );
  };

  const optionRenderer = (option: SelectOption) => {
    if (typeof props.optionRenderer === "function") {
      return props.optionRenderer(option);
    }
    return <Option {...option} />;
  };

  return (
    <SelectWithOptions
      {...rest}
      showCaret={selectable}
      options={options}
      valueFormatter={showIcon ? valueRenderer : undefined}
      optionRenderer={optionRenderer}
      maxHeight={254} // 30 * 8 + 2 * 7
    />
  );
};

const Option: React.FC<SelectOption & { size?: SizeType; index?: number }> = (
  props,
) => {
  const { size, label, value } = props;

  const { item, icon } = selectVariants();
  return (
    <SelectItem
      value={value}
      className={item({
        size,
        className: "oui-space-x-1 oui-flex oui-flex-row oui-items-center",
      })}
    >
      <TokenIcon name={value} className={icon({ size })} />
      <SelectItemText>{label}</SelectItemText>
      <ItemIndicator />
    </SelectItem>
  );
};
