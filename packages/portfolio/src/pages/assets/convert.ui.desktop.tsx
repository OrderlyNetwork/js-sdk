import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
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
    label: "Completed",
    value: "completed",
  },
  {
    label: "Pending",
    value: "pending",
  },
];

// Convert Details Modal Component
const ConvertDetailsModal = modal.create<{
  record: ConvertRecord;
  indexPrices: Record<string, number>;
  chainsInfo: any[];
}>((props) => {
  const { t } = useTranslation();
  const { visible, onOpenChange } = useModal();
  // console.log(props);

  const detailColumns = useConvertDetailColumns({
    indexPrices: props.indexPrices,
    chainsInfo: props.chainsInfo,
  });

  return (
    <SimpleDialog
      open={visible}
      onOpenChange={onOpenChange}
      title={t("portfolio.overview.convert.dialog.title.details")}
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
          root: "oui-bg-base-8 oui-max-h-[60vh] oui-overflow-y-scroll",
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
      modal.show(ConvertDetailsModal, {
        record,
        indexPrices: convertState.indexPrices,
        chainsInfo: convertState.chainsInfo as any,
      });
    }
  };

  const columns = useConvertColumns({
    onDetailsClick: handleDetailsClick,
  });

  const {
    selectedAccount,
    convertedAssetFilter,
    statusFilter,
    dateRange,
    onFilter,
    convertedAssetOptions,
  } = convertState;

  const dataFilter = useMemo(() => {
    return (
      <DataFilter
        onFilter={onFilter}
        items={[
          {
            type: "select",
            name: "account",
            value: selectedAccount,
            options: memoizedOptions,
          },
          {
            type: "select",
            name: "converted_asset",
            value: convertedAssetFilter,
            options: convertedAssetOptions,
          },
          {
            type: "select",
            name: "status",
            value: statusFilter,
            options: CONVERT_STATUS_OPTIONS,
          },
          {
            type: "range",
            name: "time",
            value: {
              from: dateRange?.[0],
              to: dateRange?.[1],
            },
          },
        ]}
      />
    );
  }, [
    selectedAccount,
    convertedAssetFilter,
    statusFilter,
    dateRange,
    onFilter,
    convertedAssetOptions,
    memoizedOptions,
  ]);

  return (
    <Flex direction="column" mt={4} itemAlign="center" className="oui-w-full">
      <Divider className="oui-w-full" />
      <Flex direction="row" className="oui-w-full">
        {dataFilter}
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
        generatedRowKey={(record) => {
          return record.convert_id.toString();
        }}
      />
    </Flex>
  );
};
