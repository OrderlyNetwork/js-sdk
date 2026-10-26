import React, { useCallback, useMemo, useState } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext, useFeatureEnabled } from "@orderly.network/react-app";
import { perpRoute, predictionRoute, type API } from "@orderly.network/types";
import {
  Flex,
  Text,
  Divider,
  Box,
  Tabs,
  TabPanel,
  DataFilter,
  formatAddress,
  Tooltip,
  InfoCircleIcon,
} from "@orderly.network/ui";
import type { SelectOption } from "@orderly.network/ui";
import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsProps,
  CombinePositionsWidget,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import { AccountType } from "../assets/assetsPage/assets.ui.desktop";
import { PortfolioProductPositionsPanel } from "./productPanel.widget";

enum TabsType {
  positions = "Positions",
  positionHistory = "Position history",
  liquidation = "Liquidation",
}

export type PortfolioPositionsPageProps = Omit<
  PositionsProps,
  "onSymbolChange"
> & {
  /**
   * Overrides navigation to the selected Perps market; defaults to opening
   * `/perp/<symbol>` through `onRouteChange` when omitted.
   */
  onSymbolChange?: (symbol: API.Symbol) => void;
  /**
   * Overrides navigation to the exact Prediction round contract; defaults to
   * opening `/prediction/<symbol>` through `onRouteChange` when omitted.
   */
  onPredictionSelect?: (symbol: string) => void;
  /**
   * Overrides the built-in product panel; receives the original Perps table.
   */
  positionProductContent?: (perpsContent: React.ReactNode) => React.ReactNode;
  /** Equivalent extension point for Position history. */
  positionHistoryProductContent?: (
    perpsContent: React.ReactNode,
  ) => React.ReactNode;
};

export const PositionsPage: React.FC<PortfolioPositionsPageProps> = ({
  onSymbolChange: hostOnSymbolChange,
  onPredictionSelect,
  positionProductContent,
  positionHistoryProductContent,
  ...positionsProps
}) => {
  const [tab, setTab] = useState(TabsType.positions);
  const { t } = useTranslation();
  const { state, isMainAccount } = useAccount();
  const { onRouteChange } = useAppContext();
  const predictionEnabled = useFeatureEnabled("prediction");
  const navigatePerp = useCallback(
    (market: API.Symbol) => {
      onRouteChange?.(perpRoute(market.symbol));
    },
    [onRouteChange],
  );
  const navigatePrediction = useCallback(
    (symbol: string) => {
      onRouteChange?.(predictionRoute(symbol));
    },
    [onRouteChange],
  );
  // Host callbacks win; otherwise navigate through the app router when present.
  const onSymbolChange =
    hostOnSymbolChange ?? (onRouteChange ? navigatePerp : undefined);
  const selectRoundSymbol =
    onPredictionSelect ?? (onRouteChange ? navigatePrediction : undefined);
  const perpsProps = { ...positionsProps, onSymbolChange };

  const subAccounts = state.subAccounts ?? [];

  const [selectedAccount, setAccount] = React.useState<string>(AccountType.ALL);

  const onAccountFilter = React.useCallback(
    (filter: { name: string; value: string }) => {
      const { name, value } = filter;
      if (name === "account") {
        setAccount(value);
      }
    },
    [],
  );

  const ALL_ACCOUNTS: SelectOption = {
    label: t("common.allAccount"),
    value: AccountType.ALL,
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("common.mainAccount"),
    value: AccountType.MAIN,
  };

  const memoizedOptions = useMemo(() => {
    if (Array.isArray(subAccounts) && subAccounts.length) {
      return [
        ALL_ACCOUNTS,
        MAIN_ACCOUNT,
        ...subAccounts.map<SelectOption>((value) => ({
          value: value.id,
          label: value?.description || formatAddress(value?.id),
        })),
      ];
    }
    return [ALL_ACCOUNTS, MAIN_ACCOUNT];
  }, [subAccounts]);

  const renderAccountFilter = () =>
    isMainAccount ? (
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
    ) : null;

  const perpsPositionsContent = isMainAccount ? (
    <CombinePositionsWidget selectedAccount={selectedAccount} {...perpsProps} />
  ) : (
    <PositionsWidget {...perpsProps} enableSortingStorage={false} />
  );

  // Binary rows share /v1/position_history (api-spec §6.2); history is
  // server-paginated, so the Perps view must filter via product_type.
  const perpsPositionHistoryContent = (
    <PositionHistoryWidget
      {...perpsProps}
      enableSortingStorage={false}
      productType="PERP"
    />
  );

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
          size="lg"
          classNames={{
            tabsList: "!oui-border-none oui-pb-1",
            tabsContent: "oui-h-[calc(100%_-_32px)]",
            trigger: "oui-group",
          }}
          className="oui-h-full"
        >
          <TabPanel value={TabsType.positions} title={t("common.positions")}>
            {positionProductContent || !predictionEnabled ? (
              <>
                {renderAccountFilter()}
                {positionProductContent?.(perpsPositionsContent) ??
                  perpsPositionsContent}
              </>
            ) : (
              <PortfolioProductPositionsPanel
                key={state.accountId}
                type="positions"
                selectedAccount={selectedAccount}
                perpsContent={perpsPositionsContent}
                accountFilter={renderAccountFilter()}
                onPredictionSelect={selectRoundSymbol}
              />
            )}
          </TabPanel>
          <TabPanel
            value={TabsType.positionHistory}
            title={t("positions.positionHistory")}
          >
            {positionHistoryProductContent || !predictionEnabled ? (
              (positionHistoryProductContent?.(perpsPositionHistoryContent) ??
              perpsPositionHistoryContent)
            ) : (
              <PortfolioProductPositionsPanel
                key={state.accountId}
                type="positionHistory"
                perpsContent={perpsPositionHistoryContent}
                onPredictionSelect={selectRoundSymbol}
              />
            )}
          </TabPanel>
          <TabPanel value={TabsType.liquidation} title={<LiquidationTab />}>
            <LiquidationWidget />
          </TabPanel>
        </Tabs>
      </Box>
    </Flex>
  );
};

const LiquidationTab: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-gap-x-1">
      <span>{t("positions.liquidation")}</span>
      <Tooltip
        className="oui-max-w-[275px] oui-bg-base-6"
        content={
          <div>
            <div className="oui-text-pretty">
              {t("positions.Liquidation.tooltip.liquidation")}
            </div>
            <div>
              <a
                href="https://orderly.network/docs/introduction/trade-on-orderly/perpetual-futures/liquidations"
                target="_blank"
                rel="noopener noreferrer"
                className="oui-text-primary"
              >
                {t("positions.Liquidation.tooltip.viewMore")}
              </a>
            </div>
          </div>
        }
        arrow={{
          className: "oui-fill-base-6",
        }}
      >
        <button className="oui-hidden group-data-[state=active]:oui-block">
          <InfoCircleIcon />
        </button>
      </Tooltip>
    </div>
  );
};
