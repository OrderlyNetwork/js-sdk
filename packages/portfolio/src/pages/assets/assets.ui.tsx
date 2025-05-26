import React from "react";
import pick from "ramda/es/pick";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
// import { useTranslation } from "@orderly.network/i18n";
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
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import type { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import type { useAssetsScriptReturn } from "./assets.script";
import type { AssetsWidgetProps } from "./assets.widget";

export type AssetsProps = useAssetsScriptReturn;

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

export const AssetsTable: React.FC<
  Readonly<AssetsWidgetProps & ReturnType<typeof useAccount>>
> = (props) => {
  const { state, selectedAccount, columns, dataSource, onFilter } = props;

  const { t } = useTranslation();

  const ALL_ACCOUNTS: SelectOption = {
    label: t("portfolio.asstes.allAccount"),
    value: "All accounts",
  };

  const MAIN_ACCOUNT: SelectOption = {
    label: t("portfolio.asstes.mainAccount"),
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
    <Card
      className="w-full"
      title={
        <Flex
          gap={4}
          direction={"column"}
          itemAlign={"start"}
          justify={"between"}
        >
          <Text size="lg">{t("portfolio.asstes.asstes")}</Text>
          <TotalValue
            {...pick(["totalValue", "visible", "onToggleVisibility"], props)}
          />
        </Flex>
      }
    >
      <Divider />
      <DataFilter
        onFilter={onFilter}
        items={[
          {
            type: "select",
            name: "account",
            value: selectedAccount,
            options: memoizedOptions,
          },
        ]}
      />
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
                    {record?.description || formatAddress(record?.id)}
                  </Badge>
                ) : null,
            };
          }
        }}
      />
    </Card>
  );
};
