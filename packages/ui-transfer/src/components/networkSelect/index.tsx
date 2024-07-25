import {
  Box,
  ChainIcon,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
  cn,
} from "@orderly.network/ui";
import { ExchangeIcon } from "../../icons";
import { API, CurrentChain } from "@orderly.network/types";

type NetworkSelectProps = {
  chains: API.NetworkInfos[];
  currentChain: CurrentChain;
};

export const NetworkSelect: React.FC<NetworkSelectProps> = (props) => {
  const { chains, currentChain } = props;

  const trigger = (
    <Flex
      intensity={500}
      className="oui-rounded-t-xl oui-rounded-b-sm oui-border oui-border-line oui-cursor-pointer"
      height={54}
      px={3}
      justify="between"
      itemAlign="center"
    >
      <div className="oui-leading-0">
        <Text size="2xs" intensity={54}>
          Network
        </Text>

        <Flex gapX={1} className="oui-mt-[2px]">
          <ChainIcon
            className="oui-w-[18px] oui-h-[18px]"
            chainId={currentChain?.id}
          />
          <Text size="sm" intensity={80}>
            {currentChain?.info?.network_infos?.name}
          </Text>
        </Flex>
      </div>
      <ExchangeIcon className="oui-text-base-contrast-54" />
    </Flex>
  );

  const content = chains.map((chain) => {
    const isActive = chain.chain_id === currentChain?.id;
    return (
      <Flex
        px={2}
        className={cn(
          "oui-deposit-network-select-item",
          "hover:oui-bg-base-5 oui-h-[30px]",
          isActive && "oui-bg-base-5"
        )}
        r="md"
        justify="between"
      >
        <Flex gapX={1} itemAlign="center">
          <ChainIcon
            className="oui-w-[18px] oui-h-[18px]"
            chainId={chain.chain_id}
          />
          <Text size="2xs" intensity={54}>
            {chain.name}
          </Text>
          {chain.bridgeless && (
            <Flex
              className="oui-bg-success-light/15"
              height={18}
              px={2}
              r="md"
              justify="center"
              itemAlign="center"
            >
              <Text size="2xs" className="oui-text-success-light">
                lowest fee
              </Text>
            </Flex>
          )}
        </Flex>
        {isActive && (
          <Box
            width={4}
            height={4}
            r="full"
            className="oui-deposit-network-select-active-dot oui-bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)]"
          />
        )}
      </Flex>
    );
  });

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={2}
          className={cn(
            "oui-deposit-token-select-dropdown-menu-content",
            "oui-w-[var(--radix-dropdown-menu-trigger-width)]",
            "oui-rounded-md oui-select-none"
          )}
        >
          <Box p={1} intensity={800}>
            {content}
          </Box>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
