import React, { ReactElement, useMemo } from "react";
import {
  ItemIndicator,
  SelectItem,
  SelectItemText,
} from "@radix-ui/react-select";
import { AvatarSizeType } from "../avatar/avatar";
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
  iconSize?: AvatarSizeType;
} & SelectProps<string>;

export const TokenSelect: React.FC<TokenSelectProps> = (props) => {
  const { tokens, showIcon = true, iconSize, ...rest } = props;
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
        <TokenIcon
          name={value}
          className={iconSize ? undefined : icon({ size: props.size })}
          size={iconSize}
        />
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
    return <Option {...option} iconSize={iconSize} />;
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

type OptionProps = SelectOption & {
  index?: number;
  size?: SizeType;
  iconSize?: AvatarSizeType;
};

const Option: React.FC<OptionProps> = (props) => {
  const { size, label, value, iconSize } = props;

  const { item, icon } = selectVariants();
  return (
    <SelectItem
      value={value}
      className={item({
        size,
        className: "oui-space-x-1 oui-flex oui-flex-row oui-items-center",
      })}
    >
      <TokenIcon
        name={value}
        className={iconSize ? undefined : icon({ size })}
        size={iconSize}
      />
      <SelectItemText>{label}</SelectItemText>
      <ItemIndicator />
    </SelectItem>
  );
};
