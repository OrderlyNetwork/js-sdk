import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
  Badge,
  Box,
  ChainIcon,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  ScrollArea,
  Spinner,
  Text,
  cn,
} from "@orderly.network/ui";
import { ExchangeIcon } from "../icons";
import { CurrentChain } from "./useChainSelect";

export type ChainSelectProps = {
  chains: API.NetworkInfos[];
  value: CurrentChain;
  onValueChange: (chain: API.NetworkInfos) => Promise<void>;
  wrongNetwork?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export const ChainSelect: React.FC<ChainSelectProps> = (props) => {
  const { chains, value, wrongNetwork, loading, disabled } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const selectable = wrongNetwork || chains?.length > 1;

  const chainIcon = wrongNetwork ? (
    <Flex
      width={18}
      height={18}
      intensity={100}
      r="full"
      justify="center"
      itemAlign="center"
    >
      <Text size="2xs" intensity={80}>
        U
      </Text>
    </Flex>
  ) : (
    <ChainIcon className="oui-size-[18px]" chainId={value?.id} />
  );

  const chainName = wrongNetwork ? "Unknown" : value?.info?.network_infos?.name;

  const currentChain = chains.find((chain) => chain.chain_id === value?.id);
  const extendedCurrentChain = currentChain as API.NetworkInfos & {
    isSupported?: boolean;
  };
  const isCurrentChainSupported =
    !currentChain || extendedCurrentChain?.isSupported !== false;

  const renderRightIcon = () => {
    if (loading) {
      return <Spinner size="sm" />;
    }
    if (selectable) {
      return <ExchangeIcon className="oui-text-base-contrast-54" />;
    }
  };

  const trigger = (
    <Flex
      intensity={500}
      className={cn(
        "oui-rounded-b-sm oui-rounded-t-xl oui-border oui-border-line",
        disabled
          ? "oui-cursor-not-allowed"
          : selectable
            ? "oui-cursor-pointer"
            : "oui-cursor-auto",
        props.className,
      )}
      height={54}
      px={3}
      justify="between"
      itemAlign="center"
    >
      <Flex
        direction="column"
        itemAlign="start"
        justify="center"
        className="oui-gap-0"
      >
        <Flex className="oui-h-[16px] oui-items-center">
          <Text size="2xs" intensity={54}>
            {t("transfer.network")}
          </Text>
        </Flex>
        <Flex gapX={1} itemAlign="center" className="oui-mt-0.5 oui-h-[20px]">
          {chainIcon}
          <Text size="sm" intensity={80} className="oui-leading-none">
            {chainName}
          </Text>
          {!isCurrentChainSupported && (
            <Badge color="danger" size="xs">
              {t("common.notSupported")}
            </Badge>
          )}
        </Flex>
      </Flex>
      {renderRightIcon()}
    </Flex>
  );

  const content = chains.map((chain, index) => {
    const extendedChain = chain as API.NetworkInfos & {
      isSupported?: boolean;
    };
    const isActive = chain.chain_id === value?.id;
    const isSupported = extendedChain.isSupported !== false;
    return (
      <Flex
        key={chain.chain_id}
        px={2}
        r="base"
        justify="between"
        itemAlign="center"
        className={cn(
          "oui-deposit-network-select-item",
          "oui-h-[30px]",
          isSupported
            ? "oui-cursor-pointer hover:oui-bg-base-5"
            : "oui-cursor-not-allowed",
          isActive && "oui-bg-base-5",
          index !== 0 && "oui-mt-[2px]",
        )}
        onClick={async () => {
          if (!isSupported) return;
          setOpen(false);
          await props.onValueChange(chain);
        }}
      >
        <Flex gapX={1} itemAlign="center">
          <ChainIcon
            className={cn("oui-size-[18px]", !isSupported && "oui-opacity-50")}
            chainId={chain.chain_id}
          />
          <Text size="2xs" intensity={isSupported ? 54 : 36}>
            {chain.name}
          </Text>
          {!isSupported && (
            <Badge color="danger" size="xs">
              {t("common.notSupported")}
            </Badge>
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
    <DropdownMenuRoot open={selectable ? open : false} onOpenChange={setOpen}>
      <DropdownMenuTrigger disabled={disabled} asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={2}
          className={cn(
            "oui-deposit-token-select-dropdown-menu-content",
            "oui-bg-base-8 oui-p-1",
            "oui-w-[var(--radix-dropdown-menu-trigger-width)]",
            "oui-select-none oui-rounded-md",
          )}
        >
          <ScrollArea>
            <div className="oui-max-h-[110px]">{content}</div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
