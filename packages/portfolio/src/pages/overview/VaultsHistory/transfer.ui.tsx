import React from "react";
import type { API } from "@veltodefi/types";
import { DataFilter } from "@veltodefi/ui";
import { AuthGuardDataTable } from "@veltodefi/ui-connector";
import { useColumns } from "./column";
import type { useVaultsHistoryHookReturn } from "./useDataSource.script";

type HistoryProps = useVaultsHistoryHookReturn;

export const VaultsHistoryUI: React.FC<Readonly<HistoryProps>> = (props) => {
  const { dataSource, dateRange, isLoading, onFilter } = props;

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
      <AuthGuardDataTable<API.StrategyVaultHistoryRow>
        bordered
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        className="oui-font-semibold"
        classNames={{ root: "oui-h-[calc(100%_-_49px)]" }}
        pagination={props.pagination}
        generatedRowKey={(row) => row.id}
      />
    </>
  );
};
