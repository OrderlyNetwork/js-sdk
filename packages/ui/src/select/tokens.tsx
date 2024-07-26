import { useMemo } from "react";
import { SelectOption, SelectWithOptions } from "./withOptions";
import { SelectProps } from "./select";
import { selectVariants } from "./selectPrimitive";
import { Text } from "../typography";
import {
  ItemIndicator,
  SelectItem,
  SelectItemText,
} from "@radix-ui/react-select";
import { TokenIcon } from "../icon";
import { SizeType } from "../helpers/sizeType";
import { Flex } from "../flex";

type TokenItem = {
  name: string;
};

export type TokenSelect = {
  tokens: TokenItem[];
  showIcon?: boolean;
} & SelectProps<string>;

export const TokenSelect = (props: TokenSelect) => {
  const { tokens, showIcon = true, ...rest } = props;
  const { icon } = selectVariants();

  const options = useMemo(() => {
    return tokens.map((token) => {
      return {
        label: token.name,
        value: token.name,
      };
    });
  }, [tokens]);

  const selectable = options.length > 1;

  return (
    <SelectWithOptions
      {...rest}
      showCaret={selectable}
      options={options}
      optionRenderer={(option) => {
        // @ts-ignore
        return <Option {...option} />;
      }}
      open={selectable ? undefined : false}
      valueRenderer={
        showIcon
          ? (value) => {
              return (
                <Flex gapX={1}>
                  <TokenIcon
                    name={value}
                    className={icon({ size: props.size })}
                  />
                  <Text weight="semibold" intensity={54}>
                    {value}
                  </Text>
                </Flex>
              );
            }
          : undefined
      }
    />
  );
};

const Option = (
  props: SelectOption & {
    size: SizeType;
    index: number;
  }
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
