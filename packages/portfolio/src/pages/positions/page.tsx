import { useState } from "react";
import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  Text,
  Divider,
  Box,
  Tabs,
  TabPanel,
  DataFilter,
  formatAddress,
} from "@orderly.network/ui";
import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsProps,
  CombinePositionsWidget,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import type { SelectOption } from "@orderly.network/ui/src/select/withOptions";

enum TabsType {
  positions = "Positions",
  positionHistory = "Position history",
  liquidation = "Liquidation",
}

export const PositionsPage: React.FC<PositionsProps> = (props) => {
  const [tab, setTab] = useState(TabsType.positions);
  const { t } = useTranslation();
  const [selectedAccount, setSelectedAccount] = React.useState("All accounts");
  const { state, isMainAccount } = useAccount();

  const onAccountFilter = React.useCallback(
    (filter: { name: string; value: string }) => {
      const { name, value } = filter;
      if (name === "account") {
        setSelectedAccount(value);
      }
    },
    [],
  );

  const ALL_ACCOUNTS: SelectOption = {
    label: t("common.allAccount"),
    value: "All accounts",
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("common.mainAccount"),
    value: "Main accounts",
  };

  const memoizedOptions = React.useMemo(() => {
    const subs = Array.isArray(state.subAccounts) ? state.subAccounts : [];
    return [
      ALL_ACCOUNTS,
      // MAIN_ACCOUNT,
      ...subs.map<SelectOption>((value) => ({
        value: value.id,
        label: value?.description || formatAddress(value?.id),
      })),
    ];
  }, [state.subAccounts]);
  return (
    <Flex
      // p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      width="100%"
      height="100%"
    >
      <Flex>
        <Text size="lg">{t("common.positions")}</Text>
      </Flex>
      <Divider className="oui-w-full" />
      {/* 26(title height) + 1(divider) + 32 (padding) */}
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <Tabs
          value={tab}
          onValueChange={(e) => setTab(e as any)}
          classNames={{
            tabsList: "!oui-border-none oui-pb-1",
            tabsContent: "oui-h-[calc(100%_-_28px)]",
          }}
          className="oui-h-full"
        >
          <TabPanel value={TabsType.positions} title={t("common.positions")}>
            <DataFilter
              onFilter={onAccountFilter}
              items={[
                {
                  type: "select",
                  name: "account",
                  value: selectedAccount,
                  options: memoizedOptions,
                },
              ]}
            />
            {isMainAccount ? (
              <CombinePositionsWidget
                selectedAccount={selectedAccount}
                {...props}
              />
            ) : (
              <PositionsWidget {...props} />
            )}
          </TabPanel>
          <TabPanel
            value={TabsType.positionHistory}
            title={t("positions.positionHistory")}
          >
            <PositionHistoryWidget {...props} />
          </TabPanel>
          <TabPanel
            value={TabsType.liquidation}
            title={t("positions.liquidation")}
          >
            <LiquidationWidget />
          </TabPanel>
        </Tabs>
      </Box>
    </Flex>
  );
};
