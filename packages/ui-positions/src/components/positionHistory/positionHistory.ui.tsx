import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { PositionHistoryExt, PositionHistoryState } from "./positionHistory.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { API } from "@orderly.network/types";
import { usePositionHistoryColumn } from "./desktop/usePositionHistoryColumn";


export const PositionHistory: FC<PositionHistoryState> = (props) => {
    const { symbolsInfo, onSymbolChange } = props;
    const column = usePositionHistoryColumn({
        onSymbolChange,
        symbolsInfo,
    })

    return (
        <AuthGuardDataTable<PositionHistoryExt>
        loading={props.isLoading}
        id="oui-desktop-positions-content"
        columns={column}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: any) => record.symbol}
        // renderRowContainer={(record: any, index: number, children: any) => {
        //   return (
        //     <SymbolProvider symbol={record.symbol}>
        //       <PositionsRowProvider position={record}>
        //         {children}
        //       </PositionsRowProvider>
        //     </SymbolProvider>
        //   );
        // }}
        manualPagination={false}
        // pagination={pagination}
        testIds={{
          body: "oui-testid-dataList-positionHistory-tab-body"
        }}
      />
    );
}


export const MobilePositionHistory: FC<PositionHistoryState> = (props) => {

    return (
        <Flex></Flex>
    );
}
