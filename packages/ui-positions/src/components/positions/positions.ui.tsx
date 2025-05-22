import React from "react";
import { API } from "@orderly.network/types";
import { ListView } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { SymbolProvider } from "../../providers/symbolProvider";
import { PositionsProps } from "../../types/types";
import { PositionsRowProvider } from "./desktop/positionRowContext";
import { useColumn } from "./desktop/useColumn";
import { PositionCellWidget } from "./mobile/positionCell";
import { PositionsBuilderState } from "./usePositionsBuilder.script";

export const Positions: React.FC<Readonly<PositionsBuilderState>> = (props) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig, pagination } = props;

  const column = useColumn({
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange: props.onSymbolChange,
  });

  return (
    <AuthGuardDataTable<API.PositionTPSLExt>
      loading={props.isLoading}
      id="oui-desktop-positions-content"
      columns={column}
      bordered
      dataSource={props.dataSource}
      generatedRowKey={(record: any) => record.symbol}
      renderRowContainer={(record: any, index: number, children: any) => {
        return (
          <SymbolProvider symbol={record.symbol}>
            <PositionsRowProvider position={record}>
              {children}
            </PositionsRowProvider>
          </SymbolProvider>
        );
      }}
      manualPagination={false}
      pagination={pagination}
      testIds={{
        body: "oui-testid-dataList-position-tab-body",
      }}
    />
  );
};

export const MobilePositions: React.FC<
  Readonly<PositionsBuilderState & PositionsProps>
> = (props) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  return (
    <ListView
      className="oui-hide-scrollbar oui-w-full oui-space-y-0 oui-overflow-y-hidden"
      contentClassName="!oui-space-y-1"
      dataSource={props.dataSource}
      renderItem={(item, index) => (
        <SymbolProvider symbol={item.symbol}>
          <PositionsRowProvider position={item}>
            <PositionCellWidget
              item={item}
              index={index}
              pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
              sharePnLConfig={sharePnLConfig}
              onSymbolChange={props.onSymbolChange}
            />
          </PositionsRowProvider>
        </SymbolProvider>
      )}
    />
  );
};
