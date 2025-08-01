import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { DataFilter } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useColumns } from "./column";
import type { useVaultsHistoryHookReturn } from "./useDataSource.script";

type HistoryProps = useVaultsHistoryHookReturn;

export const VaultsHistoryUI: React.FC<Readonly<HistoryProps>> = (props) => {
  const { dataSource, dateRange, isLoading, onFilter } = props;

  const { t } = useTranslation();

  const columns = useColumns();

  return (
    <>
      <DataFilter
        onFilter={onFilter}
        items={[
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
      <AuthGuardDataTable<any>
        bordered
        columns={columns}
        dataSource={dataSource as any}
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
