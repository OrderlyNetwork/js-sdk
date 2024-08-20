import { DataTable } from "@orderly.network/ui";
import { useColumn } from "./useColumn";
import { API } from "@orderly.network/types";
import { PositionsBuilderState } from "./usePositionsBuilder.script";
import { PositionsRowProvider } from "./positionRowContext";
import { SymbolProvider } from "../providers/symbolProvider";

export const Positions = (props: PositionsBuilderState) => {
  const column = useColumn();
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
