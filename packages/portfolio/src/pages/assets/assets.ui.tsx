import React, { useMemo } from "react";
import pick from "ramda/es/pick";
import { useTranslation } from "@orderly.network/i18n";
import {
  Text,
  Card,
  Flex,
  Divider,
  gradientTextVariants,
  EyeIcon,
  EyeCloseIcon,
  cn,
  DataFilter,
  Badge,
  formatAddress,
  Tabs,
  TabPanel,
  ArrowDownShortIcon,
  Button,
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import type { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import type { useAssetsScriptReturn } from "./assets.script";
import type { AssetsWidgetProps } from "./assets.widget";
import { ConvertHistoryWidget } from "./convert.widget";

export type AssetsProps = useAssetsScriptReturn;

export enum AccountType {
  ALL = "All accounts",
  MAIN = "Main accounts",
}

const TotalValue: React.FC<
  Readonly<
    Pick<AssetsWidgetProps, "totalValue" | "visible" | "onToggleVisibility">
  >
> = (props) => {
  const { totalValue, visible, onToggleVisibility } = props;
  const { t } = useTranslation();
  const Icon = visible ? EyeIcon : EyeCloseIcon;
  return (
    <Flex direction="column" gap={1} className="oui-text-2xs" itemAlign="start">
      <Flex gap={1} justify="start" itemAlign="center">
        <Text size="2xs" color="neutral" weight="semibold">
          {t("common.totalValue")}
        </Text>
        <button onClick={onToggleVisibility}>
          <Icon size={18} className={cn("oui-text-base-contrast-54")} />
        </button>
      </Flex>
      <Flex justify={"start"} itemAlign="end" gap={1}>
        <Text.numeral
          visible={visible}
          weight="bold"
          size="2xl"
          className={gradientTextVariants({ color: "brand" })}
          as="div"
          padding={false}
          dp={2}
        >
          {totalValue ?? "--"}
        </Text.numeral>
        <Text as="div" weight="bold">
          USDC
        </Text>
      </Flex>
    </Flex>
  );
};

const DepositAndWithdrawButton: React.FC<
  Readonly<
    Pick<AssetsWidgetProps, "isMainAccount" | "onWithdraw" | "onDeposit">
  >
> = (props) => {
  const { t } = useTranslation();
  const { isMainAccount, onWithdraw, onDeposit } = props;
  if (!isMainAccount) {
    return null;
  }
  return (
    <Flex
      className="oui-text-2xs oui-text-base-contrast-54"
      itemAlign="center"
      gap={3}
    >
      <Button
        fullWidth
        color="secondary"
        size="md"
        onClick={onWithdraw}
        data-testid="oui-testid-assetView-withdraw-button"
      >
        <ArrowDownShortIcon
          color="white"
          opacity={1}
          className="oui-rotate-180"
        />
        <Text>{t("common.withdraw")}</Text>
      </Button>
      <Button
        data-testid="oui-testid-assetView-deposit-button"
        fullWidth
        size="md"
        onClick={onDeposit}
      >
        <ArrowDownShortIcon color="white" opacity={1} />
        <Text>{t("common.deposit")}</Text>
      </Button>
    </Flex>
  );
};

export const AssetsTable: React.FC<Readonly<AssetsWidgetProps>> = (props) => {
  const {
    state,
    isMainAccount,
    selectedAccount,
    selectedAsset,
    columns,
    dataSource,
    onFilter,
    holding,
  } = props;

  const { t } = useTranslation();

  const ALL_ACCOUNTS: SelectOption = {
    label: t("common.allAccount"),
    value: AccountType.ALL,
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("common.mainAccount"),
    value: AccountType.MAIN,
  };

  const ALL_ASSETS: SelectOption = {
    label: t("common.allAssets", "All assets"),
    value: "all",
  };

  const subAccounts = state.subAccounts ?? [];

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

  // Create asset options from holding data - optimized and simplified
  const memoizedAssetOptions = useMemo(() => {
    if (!Array.isArray(holding) || holding.length === 0) {
      return [ALL_ASSETS];
    }

    // Extract unique tokens from stable holding data only
    const uniqueTokens = [
      ...new Set(
        holding
          .filter((item) => item.token) // Filter out items without token
          .map((item) => item.token), // Extract token names
      ),
    ];

    // Create options array
    const assetOptions = uniqueTokens.map((token) => ({
      value: token,
      label: token,
    }));

    return [ALL_ASSETS, ...assetOptions];
  }, [holding]);

  return (
    <Card classNames={{ content: "!oui-py-6" }}>
      <Tabs
        defaultValue="assets"
        variant="contained"
        classNames={{ tabsList: "" }}
        size="lg"
      >
        <TabPanel value="assets" title={t("common.assets")}>
          <Flex
            direction={"row"}
            itemAlign={"center"}
            justify={"between"}
            my={4}
          >
            <TotalValue
              {...pick(["totalValue", "visible", "onToggleVisibility"], props)}
            />
            <DepositAndWithdrawButton
              {...pick(["isMainAccount", "onDeposit", "onWithdraw"], props)}
            />
          </Flex>
          <Divider />
          {isMainAccount && (
            <DataFilter
              onFilter={onFilter}
              items={[
                {
                  type: "select",
                  name: "account",
                  value: selectedAccount,
                  options: memoizedOptions,
                },
                {
                  type: "select",
                  name: "asset",
                  value: selectedAsset,
                  options: memoizedAssetOptions,
                },
              ]}
            />
          )}
          <AuthGuardDataTable
            bordered
            className="oui-font-semibold"
            classNames={{ root: "oui-bg-transparent" }}
            columns={columns}
            dataSource={dataSource}
            expanded
            getSubRows={(row) => row.children}
            generatedRowKey={(record) => {
              return `${record.account_id}${record.token ? `_${record.token}` : ""}`;
            }}
            onCell={(column, record) => {
              const isGroup = (record.children ?? []).length > 0;
              if (isGroup) {
                return {
                  children:
                    column.id === "token" ? (
                      <Badge color="neutral" size="xs">
                        {record?.description || formatAddress(record?.id ?? "")}
                      </Badge>
                    ) : null,
                };
              }
            }}
          />
        </TabPanel>
        <TabPanel value="convertHistory" title={"Convert History"}>
          <ConvertHistoryWidget memoizedOptions={memoizedOptions} />
        </TabPanel>
      </Tabs>
    </Card>
  );
};
