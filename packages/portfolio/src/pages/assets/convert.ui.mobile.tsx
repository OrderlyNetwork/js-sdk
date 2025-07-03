import { useTranslation } from "@orderly.network/i18n";
import {
  useModal,
  SimpleDialog,
  modal,
  Text,
  Divider,
  TokenIcon,
  Flex,
  DataFilter,
} from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { ConvertedAssetColumn } from "./convert.column";
import { useConvertScript } from "./convert.script";
import { CONVERT_STATUS_OPTIONS } from "./convert.ui.desktop";
import { ConvertRecord, ConvertTransaction } from "./type";

type ConvertMobileUIProps = {
  convertState: ReturnType<typeof useConvertScript>;
  memoizedOptions: SelectOption[];
};

type ConvertMobileItemProps = {
  item?: any;
};

type ConvertMobileFieldProps = {
  label: string;
  value?: string | number;
  className?: string;
  copyable?: boolean;
  rule?: "address";
};

export const ConvertMobileUI: React.FC<ConvertMobileUIProps> = ({
  convertState,
  memoizedOptions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="oui-flex oui-flex-col oui-gap-1 oui-px-3">
      <Flex direction="row" className="oui-w-full oui-overflow-hidden">
        <DataFilter
          className="oui-overflow-x-scroll"
          onFilter={convertState.onFilter}
          items={[
            {
              size: "sm",
              type: "picker",
              name: "account",
              value: convertState.selectedAccount,
              options: memoizedOptions,
            },
            {
              size: "sm",
              type: "picker",
              name: "converted_asset",
              value: convertState.convertedAssetFilter,
              options: convertState.convertedAssetOptions,
            },
            {
              size: "sm",
              type: "picker",
              name: "status",
              value: convertState.statusFilter,
              options: CONVERT_STATUS_OPTIONS,
            },
            {
              size: "sm",
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
      {convertState.dataSource.map((item) => (
        <ConvertMobileItem key={item.convert_id} item={item} />
      ))}
    </div>
  );
};

const ConvertMobileField: React.FC<ConvertMobileFieldProps> = ({
  label,
  value,
  rule,
  copyable = false,
  className = "",
}) => {
  return (
    <div
      className={`oui-text-2xs oui-font-semibold oui-text-base-contrast-80 [&_p]:oui-text-base-contrast-36 ${className}`}
    >
      <p>{label}</p>
      <Text.formatted rule={rule} copyable={copyable}>
        {value}
      </Text.formatted>
    </div>
  );
};

const ConvertMobileItem: React.FC<ConvertMobileItemProps> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  console.log("item", item);

  if (!item) {
    return null;
  }

  const totalHaircut = item.details.reduce(
    (sum: number, detail: ConvertTransaction) => sum + detail.haircut,
    0,
  );

  return (
    <div className="oui-flex oui-flex-col oui-gap-2 oui-rounded-xl oui-bg-base-9 oui-p-2">
      <div className="oui-flex oui-justify-between">
        <div className="oui-flex oui-items-center oui-text-xs oui-font-semibold oui-text-base-contrast-80">
          <ConvertedAssetColumn convertedAssets={item.converted_asset} />
          <div
            className="oui-ml-2 oui-text-primary"
            onClick={() => {
              modal.show(ConverHistoryItemDetailsDialog, { item });
            }}
          >
            Details
          </div>
        </div>
        <Text.formatted
          className="oui-text-2xs oui-text-base-contrast-36"
          rule="date"
        >
          {item.created_time}
        </Text.formatted>
      </div>

      {/* 5 fields in grid container: 3 per row, wrap to next line */}
      <div className="oui-grid oui-grid-cols-3 oui-gap-2">
        <ConvertMobileField label="USDC amount" value={item.received_qty} />
        <ConvertMobileField label={t("common.fee")} value={totalHaircut} />
        <ConvertMobileField
          label="Convert ID"
          value={item.convert_id}
          copyable={true}
        />
        <ConvertMobileField label="Type" value={item.type} />
        <ConvertMobileField label="Status" value={item.status} />
      </div>
    </div>
  );
};

type ConvertHistoryItemDetailsDialogProps = {
  item: ConvertRecord;
};

const ConverHistoryItemDetailsDialog =
  modal.create<ConvertHistoryItemDetailsDialogProps>((props) => {
    const { item } = props;
    const { t } = useTranslation();
    const { visible, hide, resolve, reject, onOpenChange } = useModal();

    return (
      <SimpleDialog
        title="Convert details"
        open={visible}
        onOpenChange={onOpenChange}
      >
        <div className="oui-flex oui-h-[300px] oui-flex-col oui-gap-3 oui-overflow-y-auto oui-rounded-lg oui-bg-base-7 oui-p-2">
          {item.details.map((detail, index) => (
            <>
              <div className="oui-flex oui-flex-col oui-gap-2">
                <div className="oui-flex oui-items-center oui-gap-1">
                  <TokenIcon name={detail.converted_asset} size="xs" />
                  <div className="oui-text-xs oui-text-base-contrast-80">
                    {detail.converted_asset}
                  </div>
                </div>
                <div className="oui-grid oui-grid-cols-3 oui-gap-2">
                  <ConvertMobileField
                    label="Qty."
                    value={detail.converted_qty}
                  />
                  <ConvertMobileField
                    label="USDC amount"
                    value={detail.received_qty}
                  />
                  <ConvertMobileField label="Fee" value={detail.haircut} />
                  <ConvertMobileField
                    label="TxID"
                    copyable
                    rule="address"
                    value={detail.tx_id}
                  />
                  <ConvertMobileField label="Network" value={detail.venue} />
                  <ConvertMobileField label="Status" value={"Success"} />
                </div>
              </div>
              {index < item.details.length - 1 && <Divider />}
            </>
          ))}
        </div>
      </SimpleDialog>
    );
  });
