import {
  Box,
  Flex,
  Text,
  ChainIcon,
  Tabs,
  TabPanel,
  cn,
  tv,
} from "@orderly.network/ui";
import { ChainType, TChainItem } from "./type";
import { UseChainSelectorScriptReturn } from "./chainSelector.script";

export type ChainSelectorProps = {
  isWrongNetwork?: boolean;
  size?: "md" | "lg";
  className?: string;
} & UseChainSelectorScriptReturn;

const chainSelectorVariants = tv({
  slots: {
    icon: "",
    list: "oui-grid oui-grid-cols-1 oui-gap-1",
    mainnetList: '"',
    testnetList: '"',
    recommandList: "",
    item: "oui-w-full oui-rounded-md",
    tip: "oui-text-center",
  },
  variants: {
    size: {
      md: {
        icon: "oui-w-6 oui-h-6",
        list: "oui-bg-base-9 oui-rounded-lg oui-p-1",
        mainnetList: "oui-grid-cols-2 oui-mt-4",
        testnetList: "oui-grid-cols-1 oui-mt-4",
        recommandList: "oui-mt-4",
        item: "oui-bg-base-6 hover:oui-bg-base-7",
        tip: "oui-pt-6",
      },
      lg: {
        icon: "oui-w-[18px] oui-h-[18px]",
        mainnetList: "oui-grid-cols-3 oui-mt-3",
        testnetList: "oui-grid-cols-2 oui-mt-3",
        recommandList: "oui-mt-3",
        item: "oui-bg-base-5 hover:oui-bg-base-6",
        tip: "oui-pt-8",
      },
    },
    selected: {
      true: {
        item: "",
      },
      false: { item: "oui-bg-transparent" },
    },
  },
  compoundVariants: [
    {
      size: "md",
      selected: true,
      className: {
        item: "hover:oui-bg-base-6",
      },
    },
    {
      size: "lg",
      selected: true,
      className: {
        item: "hover:oui-bg-base-5",
      },
    },
  ],
  defaultVariants: {
    size: "lg",
    selected: false,
  },
});

//------------------ ChainSelector start ------------------
export const ChainSelector = (props: ChainSelectorProps) => {
  const { isWrongNetwork, size = "lg" } = props;

  const { list, recommandList, mainnetList, testnetList, icon, item, tip } =
    chainSelectorVariants({ size });

  return (
    <Box className={cn("oui-font-semibold", props.className)}>
      <Tabs
        value={props.selectedTab}
        variant="contained"
        size={size === "lg" ? "md" : "lg"}
        onValueChange={(e) => props.onTabChange(e as ChainType)}
      >
        <TabPanel value={ChainType.Mainnet} title={ChainType.Mainnet}>
          {!!props.recentChains?.length && (
            <Flex gap={2} className={recommandList()}>
              {props.recentChains?.map((item) => {
                return (
                  <RecentChainItem
                    key={item.id}
                    item={item}
                    onClick={() => props.onChange(item)}
                    iconClassName={icon()}
                  />
                );
              })}
            </Flex>
          )}

          <Box r="2xl" className={cn(list(), mainnetList())}>
            {props.chains.mainnet?.map((chain) => {
              const selected = props.selectChainId === chain.id;
              return (
                <ChainItem
                  key={chain.id}
                  selected={selected}
                  item={chain}
                  onClick={() => props.onChange(chain)}
                  className={item({ selected })}
                />
              );
            })}
          </Box>
        </TabPanel>

        <TabPanel value={ChainType.Testnet} title={ChainType.Testnet}>
          <Box r="2xl" className={cn(list(), testnetList())}>
            {props.chains.testnet?.map((chain) => {
              const selected = props.selectChainId === chain.id;
              return (
                <ChainItem
                  key={chain.id}
                  selected={selected}
                  item={chain}
                  onClick={() => props.onChange(chain)}
                  className={item({ selected })}
                />
              );
            })}
          </Box>
        </TabPanel>
      </Tabs>

      {isWrongNetwork && (
        <Box className={tip()}>
          <Text color="warning" size="xs">
            Please switch to a supported network to continue.
          </Text>
        </Box>
      )}
    </Box>
  );
};
// ------------------ ChainSelector end ------------------

// ------------------ ChainItem start ------------------
export const ChainItem = (props: {
  selected: boolean;
  item: TChainItem;
  onClick?: () => void;
  className?: string;
}) => {
  const { item } = props;
  return (
    <button className={props.className} onClick={props.onClick}>
      <Flex justify="between" className="oui-py-2.5" px={3}>
        <Flex itemAlign="center" width="100%" className="oui-gap-x-[6px]">
          <ChainIcon chainId={item.id} size="xs" />
          <Text size="2xs">{item.name}</Text>
        </Flex>
        {props.selected && (
          <Box gradient="brand" r="full" width={4} height={4} />
        )}
      </Flex>
    </button>
  );
};

// ------------------ Recent ChainItem start ------------------
export const RecentChainItem = (props: {
  item: TChainItem;
  onClick?: () => void;
  iconClassName?: string;
}) => {
  return (
    <button
      className="oui-border oui-border-line-12 oui-rounded-lg hover:oui-border-primary-light"
      onClick={props.onClick}
    >
      <Flex itemAlign="center" p={2}>
        <ChainIcon chainId={props.item.id} className={props.iconClassName} />
      </Flex>
    </button>
  );
};
