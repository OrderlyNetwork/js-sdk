import { useMemo, useState } from "react";
import { SubAccount } from "@orderly.network/hooks";
import {
  Box,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  ScrollArea,
  Text,
  cn,
} from "@orderly.network/ui";
import { ExchangeIcon } from "../../icons";

type AccountSelectProps = {
  isMainAccount?: boolean;
  subAccounts?: SubAccount[];
  value?: string;
  onValueChange: (id: string) => void;
};

export const AccountSelect: React.FC<AccountSelectProps> = (props) => {
  const { isMainAccount, subAccounts = [], value } = props;
  const [open, setOpen] = useState(false);

  const currentAccount = useMemo(() => {
    return subAccounts.find((subAccount) => subAccount.id === value);
  }, [subAccounts, value]);

  const selectable = !!subAccounts.length;

  const trigger = (
    <Flex
      intensity={500}
      className={cn(
        "oui-rounded-b-sm oui-rounded-t-xl oui-border oui-border-line",
        selectable ? "oui-cursor-pointer" : "oui-cursor-auto oui-bg-base-6",
      )}
      height={54}
      px={3}
      justify="between"
      itemAlign="center"
    >
      <Flex direction="column" itemAlign="start">
        {isMainAccount ? (
          <Text.formatted size="xs" intensity={80}>
            Main Account
          </Text.formatted>
        ) : (
          <Text.formatted size="xs" intensity={80} rule="address">
            {currentAccount?.description || currentAccount?.id}
          </Text.formatted>
        )}
        <Text intensity={36} size="2xs">
          {`ID: `}
          <Text.formatted rule="address">{currentAccount?.id}</Text.formatted>
        </Text>
      </Flex>
      {selectable && <ExchangeIcon className="oui-text-base-contrast-54" />}
    </Flex>
  );

  const content = subAccounts.map((subAccount, index) => {
    const isActive = subAccount.id === value;

    const balance = subAccount.holding.find(
      (holding) => holding.token === "USDC",
    )?.holding;
    return (
      <Flex
        key={subAccount.id}
        px={2}
        r="base"
        justify="between"
        className={cn(
          "oui-transfer-form-account-select-item",
          "oui-cursor-pointer oui-py-[6px] hover:oui-bg-base-5",
          isActive && "oui-bg-base-5",
          index !== 0 && "oui-mt-[2px]",
        )}
        onClick={async () => {
          setOpen(false);
          await props.onValueChange(subAccount.id);
        }}
      >
        <Flex gapX={1} itemAlign="center">
          <Flex direction="column" itemAlign="start" className="oui-text-2xs">
            <Text.formatted rule="address" intensity={80}>
              {subAccount?.description || subAccount?.id?.slice(0)}
            </Text.formatted>
            <Text intensity={36} size="2xs">
              {`ID: `}
              <Text.formatted rule="address">{subAccount?.id}</Text.formatted>
            </Text>
          </Flex>
        </Flex>
        <Flex gapX={3}>
          <Text.numeral size="2xs" intensity={54} unit=" USDC">
            {balance || 0}
          </Text.numeral>
          {isActive && (
            <Box
              width={4}
              height={4}
              r="full"
              className="oui-transfer-form-account-select-active-dot oui-bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)]"
            />
          )}
        </Flex>
      </Flex>
    );
  });

  return (
    <DropdownMenuRoot open={selectable ? open : false} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={2}
          className={cn(
            "oui-transfer-form-account-select-dropdown-menu-content",
            "oui-font-semibold",
            "oui-bg-base-8 oui-p-1",
            "oui-w-[var(--radix-dropdown-menu-trigger-width)]",
            "oui-select-none oui-rounded-md",
          )}
        >
          <ScrollArea>
            <div className="oui-max-h-[254px]">{content} </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
