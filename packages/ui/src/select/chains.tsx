import { PropsWithoutRef, useEffect, useMemo, useState } from "react";
import { selectVariants } from "./selectPrimitive";
import * as SelectPrimitive from "@radix-ui/react-select";
import { VariantProps } from "tailwind-variants";
import { ChainIcon } from "../icon";
import { Flex } from "../flex";
import { tv } from "../utils/tv";
import { Box } from "../box";
import { Text } from "../typography";
import { Tabs, TabPanel } from "../tabs";

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
const ChainSelectorType = {
  Mainnet: "Mainnet",
  Testnet: "Testnet",
};

type ChainItem = {
  name: string;
  id: number;
  lowestFee?: boolean;
};

type ChainSelectProps = {
  value?: number;
  onChange?: (chain: ChainItem) => void;
  storageChains?: ChainItem[];
  networkId?: string;
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
        </Flex>
        <SelectPrimitive.ItemIndicator>
          <Box width={"6px"} height={"6px"} gradient={"brand"} r={"full"} />
        </SelectPrimitive.ItemIndicator>
      </Flex>
    </SelectPrimitive.SelectItem>
  );
}

const RecommandChain = (props: {
  selected: boolean;
  item: ChainItem;
  onClick?: (chain: ChainItem) => void;
}) => {
  const { item } = props;
  return (
    <button
      className={
        props.selected
          ? "oui-border oui-border-line-12 oui-rounded-md oui-border-primary-light"
          : "oui-border oui-border-line-12 oui-rounded-md hover:oui-border-primary-light"
      }
      onClick={() => {
        props.onClick?.(item);
      }}
    >
      <Flex justify={"between"}>
        <Flex itemAlign={"center"} width={"100%"} p={2} gap={1}>
          <ChainIcon chainId={item.id} className="oui-w-[18px] oui-h-[18px]" />
        </Flex>
      </Flex>
    </button>
  );
};

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
    storageChains,
    ...rest
  } = props;

  // console.log("ChainSelectItem", props);
  const [open, toggleOpen] = useState(false);
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

  const [selectedTab, setSelectedTab] = useState(ChainSelectorType.Mainnet);

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
    toggleOpen(false);
  };

  const onTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <SelectPrimitive.Root
      {...rest}
      value={`${currentChain}`}
      onValueChange={onChange}
      open={open}
    >
      <SelectPrimitive.Trigger className={trigger()} asChild>
        <button
          className="oui-relative oui-px-3 oui-box-border oui-min-w-11"
          onClick={() => toggleOpen(true)}
        >
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
          className={content({
            className:
              "xl:oui-max-h-[500px] oui-max-h-[562px] oui-bg-base-9 oui-w-[260px]",
          })}
          align={"end"}
          sideOffset={12}
          // onCloseAutoFocus={(e) => {
          //   e.preventDefault();
          // }}
          {...contentProps}
        >
          <SelectPrimitive.Viewport className={viewport()}>
            <Tabs
              value={selectedTab}
              variant="contained"
              size="sm"
              classNames={{
                tabsList: "oui-my-3 lg:oui-pl-4 sm:oui-pl-0",
              }}
              onValueChange={(e) => onTabChange(e)}
            >
              <TabPanel
                value={ChainSelectorType.Mainnet}
                title={ChainSelectorType.Mainnet}
              >
                {!props.storageChains?.length ? (
                  <Flex className="oui-mt-2" />
                ) : (
                  <Flex
                    gap={2}
                    className="oui-text-center oui-mb-3 lg:oui-pl-4 sm:oui-pl-0"
                  >
                    {props.storageChains?.map((item) => {
                      return (
                        <RecommandChain
                          item={item}
                          key={item.id}
                          selected={currentChain === item.id}
                          onClick={(chain: ChainItem) => onChange(chain.id)}
                        />
                      );
                    })}
                  </Flex>
                )}
                {props.chains.mainnet?.map((chain, index) => {
                  return (
                    <ChainSelectItem
                      key={chain.id}
                      chain={chain}
                      itemClassName={item({
                        className: "oui-rounded-lg",
                      })}
                      iconClassName={itemSize()}
                    />
                  );
                })}
              </TabPanel>
              <TabPanel
                value={ChainSelectorType.Testnet}
                title={ChainSelectorType.Testnet}
              >
                {props.chains.testnet?.map((chain, index) => {
                  return (
                    <ChainSelectItem
                      key={chain.id}
                      chain={chain}
                      itemClassName={item({
                        className: "oui-rounded-lg",
                      })}
                      iconClassName={itemSize()}
                    />
                  );
                })}
              </TabPanel>
            </Tabs>
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

ChainSelect.displayName = "ChainSelect";

export { ChainSelect };
export type { ChainSelectProps };
