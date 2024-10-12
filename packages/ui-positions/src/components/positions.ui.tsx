import { DataTable, ListView } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { PositionsBuilderState } from "./usePositionsBuilder.script";
import { SymbolProvider } from "../providers/symbolProvider";
import { PositionsProps } from "../types/types";
import { useColumn } from "./desktop/useColumn";
import { PositionsRowProvider } from "./desktop/positionRowContext";
import { ReactNode } from "react";
import { PositionCellWidget } from "./mWeb/positionCell";

export const Positions = (props: PositionsBuilderState) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  const column = useColumn({
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
  });

  // console.log("xxxx positions", props);

  return (
    <div>
      <DataTable<API.PositionTPSLExt>
        loading={props.isLoading}
        id="oui-desktop-positions-content"
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
        columns={column}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record) => record.symbol}
        renderRowContainer={(record, index, children) => {
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
      className="oui-w-full"
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
