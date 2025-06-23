import {
  DataFilter,
  Divider,
  Flex,
  DataTable,
  modal,
  SimpleDialog,
  Text,
} from "@orderly.network/ui";
import { useModal } from "@orderly.network/ui";
import { useConvertColumns, useConvertDetailColumns } from "./convert.column";
import { useConvertScript } from "./convert.script";
import type { ConvertRecord } from "./type";

type ConvertDesktopUIProps = {
  memoizedOptions: any;
  convertState: ReturnType<typeof useConvertScript>;
};

const ASSET_OPTIONS = [
  {
    label: "All assets",
    value: "all",
  },
  {
    label: "USDC",
    value: "USDC",
  },
  {
    label: "USDT",
    value: "USDT",
  },
  {
    label: "ETH",
    value: "ETH",
  },
  {
    label: "BTC",
    value: "BTC",
  },
];

const TYPE_OPTIONS = [
  {
    label: "All types",
    value: "all",
  },
  {
    label: "Auto",
    value: "auto",
  },
  {
    label: "Manual",
    value: "manual",
  },
];

// Convert Details Modal Component
const ConvertDetailsModal = modal.create<{ record: ConvertRecord }>((props) => {
  const { visible, onOpenChange } = useModal();

  const detailColumns = useConvertDetailColumns({
    onTxClick: (txId: string) => {
      console.log("Open transaction:", txId);
    },
  });

  return (
    <SimpleDialog
      open={visible}
      onOpenChange={onOpenChange}
      title={`Convert Details - ID: ${props.record.convert_id}`}
      size="lg"
      closable
      classNames={{
        content: "oui-max-w-4xl",
      }}
    >
      <DataTable
        columns={detailColumns}
        dataSource={props.record.details}
        bordered
        className="oui-w-full"
        classNames={{
          header: "oui-h-10",
        }}
        onRow={() => ({
          className: "oui-h-[40px]",
        })}
        generatedRowKey={(record: any) =>
          record.transaction_id || Math.random().toString()
        }
      />
    </SimpleDialog>
  );
});

export const ConvertDesktopUI: React.FC<ConvertDesktopUIProps> = ({
  memoizedOptions,
  convertState,
}) => {
  const handleDetailsClick = (convertId: number) => {
    // Find the convert record by ID
    const record = convertState.dataSource.find(
      (item) => item.convert_id === convertId,
    );
    if (record) {
      modal.show(ConvertDetailsModal, { record });
    }
  };

  const columns = useConvertColumns({
    onDetailsClick: handleDetailsClick,
  });

  return (
    <Flex direction="column" mt={4} itemAlign="center" className="oui-w-full">
      <Divider className="oui-w-full" />
      <Flex direction="row" className="oui-w-full">
        <DataFilter
          onFilter={convertState.onFilter}
          items={[
            {
              type: "select",
              name: "account",
              value: convertState.selectedAccount,
              options: memoizedOptions,
            },
            {
              type: "select",
              name: "converted_asset",
              value: convertState.convertedAssetFilter,
              options: ASSET_OPTIONS,
            },
            {
              type: "select",
              name: "type",
              value: convertState.typeFilter,
              options: TYPE_OPTIONS,
            },
            {
              type: "range",
              name: "time",
              value: {
                from:
                  convertState.dateRange.from ||
                  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                to: convertState.dateRange.to || new Date(),
              },
              fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
              toDate: new Date(),
            },
          ]}
        />
      </Flex>
      <DataTable
        columns={columns}
        dataSource={convertState.dataSource}
        loading={convertState.isLoading}
        bordered
        pagination={convertState.pagination}
        manualPagination
        className="oui-w-full oui-mt-4"
        classNames={{
          root: "oui-h-[calc(100vh_-_200px)]",
          header: "oui-h-12",
        }}
        onRow={() => ({
          className: "oui-h-[48px] oui-cursor-pointer",
        })}
        generatedRowKey={(record) => record.convert_id.toString()}
      />
    </Flex>
  );
};
