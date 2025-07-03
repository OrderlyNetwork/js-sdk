import {
  DataFilter,
  Divider,
  Flex,
  DataTable,
  modal,
  SimpleDialog,
} from "@orderly.network/ui";
import { useModal } from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { useConvertColumns, useConvertDetailColumns } from "./convert.column";
import { useConvertScript } from "./convert.script";
import type { ConvertRecord } from "./type";

type ConvertDesktopUIProps = {
  memoizedOptions: SelectOption[];
  convertState: ReturnType<typeof useConvertScript>;
};

export const CONVERT_STATUS_OPTIONS = [
  {
    label: "All status",
    value: "all",
  },
  {
    label: "Success",
    value: "success",
  },
  {
    label: "Failed",
    value: "failed",
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
      title={`Convert details`}
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
          root: "oui-bg-base-8",
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
              options: convertState.convertedAssetOptions,
            },
            {
              type: "select",
              name: "status",
              value: convertState.statusFilter,
              options: CONVERT_STATUS_OPTIONS,
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
        className="oui-mt-4 oui-w-full"
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
