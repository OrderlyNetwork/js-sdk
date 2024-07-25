import {
  Box,
  ChainIcon,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
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
      <Box>
        <Text size="2xs" intensity={54}>
          Network
        </Text>
        <Flex gapX={1}>
          <ChainIcon
            className="oui-w-[18px] oui-h-[18px]"
            chainId={currentChain?.id}
          />
          <Text size="sm" intensity={80}>
            {currentChain?.info?.network_infos?.name}
          </Text>
        </Flex>
      </Box>
      <ExchangeIcon className="oui-text-base-contrast-54" />
    </Flex>
  );

  const content = chains.map((chain) => {
    return (
      <Flex
        px={2}
        className="hover:oui-bg-base-5 oui-h-[30px]"
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
        <Text.gradient
          color="brand"
          className="oui-w-1 oui-h-1"
        ></Text.gradient>
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
          className="oui-deposit-token-select-dropdown-menu-content oui-w-[var(--radix-dropdown-menu-trigger-width)] oui-rounded-md"
        >
          <Box p={1} intensity={800}>
            {content}
          </Box>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
