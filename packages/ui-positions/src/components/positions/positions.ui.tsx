import { ListView } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { PositionsBuilderState } from "./usePositionsBuilder.script";
import { SymbolProvider } from "../../providers/symbolProvider";
import { PositionsProps } from "../../types/types";
import { useColumn } from "./desktop/useColumn";
import { PositionsRowProvider } from "./desktop/positionRowContext";
import { PositionCellWidget } from "./mobile/positionCell";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";

export const Positions = (props: PositionsBuilderState) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig, pagination } = props;
  const column = useColumn({
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange: props.onSymbolChange,
  });

  // console.log("xxxx positions", props);

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
        body: "oui-testid-dataList-position-tab-body"
      }}
    />
  );
};

export const MobilePositions = (
  props: PositionsBuilderState & PositionsProps
) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  return (
    <ListView
      className="oui-w-full oui-hide-scrollbar oui-overflow-y-hidden oui-space-y-0"
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
