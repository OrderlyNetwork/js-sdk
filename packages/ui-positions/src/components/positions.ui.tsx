import { DataTable, ListView } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { PositionsBuilderState } from "./usePositionsBuilder.script";
import { SymbolProvider } from "../providers/symbolProvider";
import { PositionsProps } from "../types/types";
import { useColumn } from "./desktop/useColumn";
import { PositionsRowProvider } from "./desktop/positionRowContext";
import { PositionCellWidget } from "./mobile/positionCell";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";

export const Positions = (props: PositionsBuilderState) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  const column = useColumn({
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange: props.onSymbolChange,
  });

  // console.log("xxxx positions", props);

  return (
    <div>
      <AuthGuardDataTable<API.PositionTPSLExt>
        loading={props.isLoading}
        id="oui-desktop-positions-content"
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
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
      />
    </div>
  );
};

export const MobilePositions = (
  props: PositionsBuilderState & PositionsProps
) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  return (
    <ListView
      className="oui-w-full oui-hide-scrollbar oui-overflow-y-hidden"
      dataSource={props.dataSource}
      renderItem={(item, index) => (
        <SymbolProvider symbol={item.symbol}>
          <PositionsRowProvider position={item}>
            <PositionCellWidget
              item={item}
              index={index}
              pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
              sharePnLConfig={sharePnLConfig}
            />
          </PositionsRowProvider>
        </SymbolProvider>
      )}
    />
  );
};
