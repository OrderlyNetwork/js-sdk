import { PropsWithoutRef, useEffect, useMemo, useState } from "react";
import { selectVariants } from "./selectPrimitive";
import * as SelectPrimitive from "@radix-ui/react-select";
import { VariantProps } from "tailwind-variants";
import { ChainIcon } from "../icon";
import { Flex } from "../flex";
import { tv } from "../utils/tv";
import { Box } from "../box";
import { Either } from "../misc/either";
import { Text } from "../typography";

const chainSelectVariants = tv({
  extend: selectVariants,
  slots: {
    icon: "",
    item: ["oui-text-2xs", "oui-rounded-lg", "oui-cursor-pointer"],
    itemSize: "",
    tag: "oui-bg-success/20 oui-text-success oui-px-2 oui-rounded oui-font-semibold",
  },
  variants: {
    size: {
      xs: {
        icon: "",
      },
      sm: {
        icon: "",
      },
      md: {
        icon: "oui-w-5 oui-h-5",
        item: "oui-px-4 oui-py-3 oui-h-6 oui-box-content",
        itemSize: "oui-w-6 oui-h-6",
      },
      lg: {
        icon: "oui-w-6 oui-h-6",
      },
      xl: {
        icon: "oui-w-7 oui-h-7",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type ChainItem = {
  name: string;
  id: number;
  lowestFee?: boolean;
};

type ChainSelectProps = {
  value?: number;
  onChange?: (chain: ChainItem) => void;
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  contentProps?: PropsWithoutRef<typeof SelectPrimitive.Content>;
} & VariantProps<typeof chainSelectVariants> &
  PropsWithoutRef<typeof SelectPrimitive.Root>;

function ChainSelectItem(props: {
  chain: ChainItem;
  itemClassName: string;
  iconClassName: string;
  feeClassName: string;
  lowestFee?: boolean;
}) {
  return (
    <SelectPrimitive.SelectItem
      value={`${props.chain.id}`}
      className={props.itemClassName}
    >
      <Flex itemAlign={"center"} justify={"between"} width={"100%"}>
        <Flex gap={2} itemAlign={"center"}>
          <ChainIcon chainId={props.chain.id} className={props.iconClassName} />
          <Text size="2xs">{props.chain.name}</Text>
          {props.lowestFee && (
            <span className={props.feeClassName}>lowest fee</span>
          )}
        </Flex>
        <SelectPrimitive.ItemIndicator>
          <Box width={"6px"} height={"6px"} gradient={"brand"} r={"full"} />
        </SelectPrimitive.ItemIndicator>
      </Flex>
    </SelectPrimitive.SelectItem>
  );
}

const ChainSelect = (props: ChainSelectProps) => {
  const {
    chains = {
      mainnet: [],
      testnet: [],
    },
    size,
    error,
    variant,
    position,
    contentProps,
    value,
    ...rest
  } = props;

  // console.log("ChainSelectItem", props);

  const mergedChains = useMemo(() => {
    return [...chains.mainnet, ...chains.testnet];
  }, [chains]);

  const { trigger, icon, content, item, itemSize, viewport, tag } =
    chainSelectVariants({
      size,
      variant,
      error,
    });

  const [currentChain, setCurrentChain] = useState<number | undefined>(
    props.value
  );

  useEffect(() => {
    if (props.value !== currentChain) {
      setCurrentChain(props.value);
    }
  }, [props.value]);

  const onChange = (value: any) => {
    if (!chains || !Array.isArray(mergedChains)) return;
    const selected = mergedChains.find((chain) => chain.id === Number(value));
    setCurrentChain(selected?.id);
    if (!selected) return;
    props.onChange?.(selected);
  };

  return (
    <SelectPrimitive.Root
      {...rest}
      value={`${currentChain}`}
      onValueChange={onChange}
    >
      <SelectPrimitive.Trigger className={trigger()} asChild>
        <button className="oui-relative oui-px-3 oui-box-border oui-min-w-11">
          {!!currentChain && (
            <ChainIcon chainId={currentChain} className={icon()} />
          )}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            xmlns="http://www.w3.org/2000/svg"
            className="oui-absolute oui-right-0 oui-bottom-0"
          >
            <defs>
              <linearGradient
                id="paint0_linear_490_5080"
                x1="10"
                y1="5"
                x2="-5.79673e-08"
                y2="5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                <stop
                  offset="1"
                  stopColor="rgb(var(--oui-gradient-brand-start))"
                />
              </linearGradient>
            </defs>
            <path
              d="M10 7V0L0 10H7C8.65685 10 10 8.65685 10 7Z"
              fill="url(#paint0_linear_490_5080)"
            />
          </svg>
        </button>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position={"popper"}
          className={content({ className: "oui-w-[260px]" })}
          align={"end"}
          sideOffset={12}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          {...contentProps}
        >
          <SelectPrimitive.Viewport className={viewport()}>
            <Either
              value={
                Array.isArray(chains?.mainnet) && chains.mainnet.length > 0
              }
            >
              <SelectPrimitive.Group>
                <SelectPrimitive.Label
                  className={
                    "oui-text-2xs oui-text-base-contrast-54 oui-px-4 oui-pt-3"
                  }
                >
                  Mainnet
                </SelectPrimitive.Label>

                {chains.mainnet.map((chain) => {
                  return (
                    <ChainSelectItem
                      key={chain.id}
                      chain={chain}
                      itemClassName={item({
                        className: "oui-rounded-lg",
                      })}
                      lowestFee={chain.lowestFee}
                      iconClassName={itemSize()}
                      feeClassName={tag()}
                    />
                  );
                })}
              </SelectPrimitive.Group>
            </Either>
            <Either
              value={
                Array.isArray(chains?.testnet) && chains.testnet.length > 0
              }
            >
              <SelectPrimitive.Group>
                <SelectPrimitive.Label
                  className={
                    "oui-text-2xs oui-text-base-contrast-54 oui-px-4 oui-leading-5"
                  }
                >
                  Testnet
                </SelectPrimitive.Label>
                {chains.testnet.map((chain) => {
                  return (
                    <ChainSelectItem
                      key={chain.id}
                      chain={chain}
                      itemClassName={item({
                        className: "oui-rounded-lg",
                      })}
                      iconClassName={itemSize()}
                      feeClassName={tag()}
                    />
                  );
                })}
              </SelectPrimitive.Group>
            </Either>
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

ChainSelect.displayName = "ChainSelect";

export { ChainSelect };
export type { ChainSelectProps };
