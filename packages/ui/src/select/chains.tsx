import { FC } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  selectVariants,
} from "./selectPrimitive";
import { VariantProps, cnBase } from "tailwind-variants";
import { CoinIcon, ChainIcon } from "../icon";
import { Flex } from "../flex";

type ChainItem = {
  name: string;
  id: string;
  bridgeless?: boolean;
};

type ChainSelectProps = {
  currentChain: ChainItem;
  onChange: (chain: string) => void;
  chains: ChainItem[];
} & VariantProps<typeof selectVariants>;

const ChainSelect: FC<ChainSelectProps> = (props) => {
  const { chains, size, error, currentChain } = props;

  return (
    <SelectRoot value={currentChain.id}>
      <SelectTrigger size={size} error={error} variant="contained" asChild>
        <button className="oui-relative oui-px-3 oui-box-border">
          <CoinIcon name={currentChain.name} size={size} />
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
                <stop stopColor="#59B0FE" />
                <stop offset="1" stopColor="#26FEFE" />
              </linearGradient>
            </defs>
            <path
              d="M10 7V0L0 10H7C8.65685 10 10 8.65685 10 7Z"
              fill="url(#paint0_linear_490_5080)"
            />
          </svg>
        </button>
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => {
          return (
            <SelectItem value={chain.id} key={chain.id} size="xl">
              <Flex gap={2} itemAlign={"center"}>
                <ChainIcon chainId={chain.id} />
                <span className="oui-text-base">{chain.name}</span>
              </Flex>
            </SelectItem>
          );
        })}
      </SelectContent>
    </SelectRoot>
  );
};

ChainSelect.displayName = "ChainSelect";

export { ChainSelect };
export type { ChainSelectProps };
