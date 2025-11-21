import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
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
import { ExchangeIcon } from "../../icons";
import { CurrentChain } from "../depositForm/hooks";

type ChainSelectProps = {
  chains: API.NetworkInfos[];
  value: CurrentChain;
  onValueChange: (chain: API.NetworkInfos) => Promise<void>;
  wrongNetwork: boolean;
  loading?: boolean;
  disabled?: boolean;
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
        "oui-rounded-t-xl oui-rounded-b-sm oui-border oui-border-line",
        disabled
          ? "oui-cursor-not-allowed"
          : selectable
            ? "oui-cursor-pointer"
            : "oui-cursor-auto",
      )}
      height={54}
      px={3}
      justify="between"
      itemAlign="center"
    >
      <div>
        <Flex>
          <Text size="2xs" intensity={54}>
            {t("transfer.network")}
          </Text>
        </Flex>
        <Flex gapX={1}>
          {chainIcon}
          <Text size="sm" intensity={80}>
            {chainName}
          </Text>
        </Flex>
      </div>
      {renderRightIcon()}
    </Flex>
  );

  const content = chains.map((chain, index) => {
    const isActive = chain.chain_id === value?.id;
    return (
      <Flex
        key={chain.chain_id}
        px={2}
        r="base"
        justify="between"
        className={cn(
          "oui-deposit-network-select-item",
          "hover:oui-bg-base-5 oui-h-[30px] oui-cursor-pointer",
          isActive && "oui-bg-base-5",
          index !== 0 && "oui-mt-[2px]",
        )}
        onClick={async () => {
          setOpen(false);
          await props.onValueChange(chain);
        }}
      >
        <Flex gapX={1} itemAlign="center">
          <ChainIcon className="oui-size-[18px]" chainId={chain.chain_id} />
          <Text size="2xs" intensity={54}>
            {chain.name}
          </Text>
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
            "oui-rounded-md oui-select-none",
          )}
        >
          <ScrollArea>
            <div className="oui-max-h-[254px]">{content}</div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
