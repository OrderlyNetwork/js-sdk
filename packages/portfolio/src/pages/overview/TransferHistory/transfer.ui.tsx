import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { DataFilter, formatAddress, Text } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import type { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { useColumns } from "./column";
import type { useTransferHistoryHookReturn } from "./useDataSource.script";

type HistoryProps = useTransferHistoryHookReturn;

export const TransferHistoryUI: React.FC<
  Readonly<HistoryProps & ReturnType<typeof useAccount>>
> = (props) => {
  const { dataSource, queryParameter, state, isLoading, onFilter } = props;
  const { fromValue, targetValue, side, dateRange } = queryParameter;

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

  const columns = useColumns();

  return (
    <>
      <DataFilter
        onFilter={onFilter}
        items={[
          {
            type: "select",
            name: "fromValue",
            value: fromValue,
            options: memoizedOptions,
            prefix: "From",
          },
          {
            type: "select",
            name: "targetValue",
            value: targetValue,
            options: memoizedOptions,
            prefix: "To",
          },
          {
            type: "select",
            name: "side",
            value: side,
            options: [
              { value: "OUT", label: "Out" },
              { value: "IN", label: "In" },
            ],
          },
          {
            type: "range",
            name: "dateRange",
            value: {
              from: dateRange[0],
              to: dateRange[1],
            },
          },
        ]}
      />
      <AuthGuardDataTable<API.TransferHistoryRow>
        bordered
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        // isValidating={isValidating}
        className="oui-font-semibold"
        classNames={{ root: "oui-h-[calc(100%_-_49px)]" }}
        pagination={props.pagination}
        generatedRowKey={(row) => row.id}
      />
    </>
  );
};
