import { FC } from "react";
import {
  CaretDownIcon,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Spinner,
  Text,
  cn,
} from "@orderly.network/ui";
import { WebhookEvent } from "../../hooks/useOnrampTransactionStatus";

export type HistoryDropdownProps = {
  transactions: WebhookEvent[];
  pendingTransactions: WebhookEvent[];
};

export const HistoryDropdown: FC<HistoryDropdownProps> = ({
  transactions,
  pendingTransactions,
}) => {
  if (transactions.length === 0) {
    return (
      <Flex justify="between" itemAlign="center" className="oui-w-full">
        <Text size="sm" intensity={98} weight="semibold">
          You spend
        </Text>
      </Flex>
    );
  }

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <Flex
          justify="between"
          itemAlign="center"
          className="oui-group oui-w-full oui-cursor-pointer"
        >
          <Text size="sm" intensity={98}>
            You spend
          </Text>
          <Flex gap={1} itemAlign="center">
            {pendingTransactions.length > 0 ? (
              <Flex itemAlign="center" className="oui-gap-1.5">
                <Spinner size="sm" className="oui-text-primaryLight" />
                <Text size="2xs" intensity={54}>
                  {pendingTransactions.length} pending purchase
                  {pendingTransactions.length > 1 ? "s" : ""}
                </Text>
              </Flex>
            ) : (
              <Text size="xs" intensity={54}>
                History
              </Text>
            )}
            <CaretDownIcon
              size={10}
              className="oui-text-base-contrast-54 oui-transition-transform group-data-[state=open]:oui-rotate-180"
              opacity={1}
            />
          </Flex>
        </Flex>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          className="oui-text-semibold oui-custom-scrollbar oui-z-50 oui-max-h-[105px] oui-overflow-y-auto oui-rounded-lg oui-border oui-border-line-12 oui-bg-base-7 oui-p-1 oui-shadow-lg"
          style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
        >
          <Flex direction="column" gap={1}>
            {transactions.map((tx) => (
              <DropdownMenuItem
                key={tx.transactionId}
                className="oui-flex oui-w-full oui-cursor-default oui-items-start oui-justify-between oui-rounded-md oui-px-2 oui-py-0.5 oui-outline-none focus:oui-bg-base-6 data-[disabled]:oui-pointer-events-none data-[disabled]:oui-opacity-50"
              >
                <div className="oui-grid oui-w-full oui-grid-cols-[1.5fr_1fr_1fr_minmax(auto,max-content)] oui-items-center oui-gap-1">
                  <Text
                    size="xs"
                    weight="semibold"
                    className="oui-truncate oui-whitespace-nowrap"
                  >
                    <span className="oui-mr-2 oui-uppercase oui-text-base-contrast-80">
                      {tx.sourceCurrency}
                    </span>
                    {tx.inAmount}
                  </Text>
                  <Text
                    size="xs"
                    intensity={54}
                    className="oui-truncate oui-whitespace-nowrap oui-capitalize"
                  >
                    {tx.onramp}
                  </Text>
                  <Text
                    size="xs"
                    weight="semibold"
                    className={cn(
                      "oui-truncate oui-whitespace-nowrap oui-capitalize",
                      tx.status === "failed" || tx.status === "canceled"
                        ? "oui-text-danger"
                        : tx.status === "pending" || tx.status === "new"
                          ? "oui-text-warning"
                          : "oui-text-success",
                    )}
                  >
                    {tx.status === "paid" ? "completed" : tx.status}
                  </Text>
                  <Text
                    size="xs"
                    intensity={36}
                    className="oui-whitespace-nowrap oui-text-right"
                  >
                    {new Date(tx.statusDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </div>
              </DropdownMenuItem>
            ))}
          </Flex>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
