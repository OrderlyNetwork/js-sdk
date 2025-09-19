import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  useModal,
  modal,
  Text,
  Divider,
  TokenIcon,
  Flex,
  DataFilter,
  SimpleSheet,
  toast,
  ScrollIndicator,
} from "@orderly.network/ui";
import { ConvertRecord, ConvertTransaction } from "../type";
import { ConvertedAssetColumn } from "./convert.column";
import { useConvertScript } from "./convert.script";
import { CONVERT_STATUS_OPTIONS } from "./convert.ui.desktop";

type ConvertMobileUIProps = {
  convertState: ReturnType<typeof useConvertScript>;
};

type ConvertMobileItemProps = {
  item?: any;
  chainsInfo: any[];
};

type ConvertMobileFieldProps = {
  label: string;
  value?: string | number;
  className?: string;
  copyable?: boolean;
  rule?: "address" | "txId";
  onClick?: () => void;
};

export const ConvertMobileUI: React.FC<ConvertMobileUIProps> = ({
  convertState,
}) => {
  const { t } = useTranslation();

  const {
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
          // {
          //   size: "sm",
          //   type: "picker",
          //   name: "account",
          //   value: selectedAccount,
          //   options: memoizedOptions,
          // },
          {
            size: "md",
            type: "picker",
            name: "converted_asset",
            value: convertedAssetFilter,
            options: convertedAssetOptions,
            className: "oui-whitespace-nowrap",
          },
          {
            size: "md",
            type: "picker",
            name: "status",
            value: statusFilter,
            options: CONVERT_STATUS_OPTIONS,
            className: "oui-whitespace-nowrap",
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
    convertedAssetFilter,
    statusFilter,
    dateRange,
    onFilter,
    convertedAssetOptions,
  ]);

  return (
    <div className="oui-flex oui-flex-col oui-gap-1 oui-px-3">
      <ScrollIndicator className="oui-pr-5">
        <Flex direction="row">{dataFilter}</Flex>
      </ScrollIndicator>
      {convertState.dataSource.map((item) => (
        <ConvertMobileItem
          key={item.convert_id}
          item={item}
          chainsInfo={convertState.chainsInfo as any}
        />
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
  onClick,
}) => {
  const { t } = useTranslation();
  const onCopy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(t("common.copy.copied"));
  };
  return (
    <div
      className={`oui-text-2xs oui-font-semibold oui-text-base-contrast-80 [&_p]:oui-text-base-contrast-36 ${className}`}
      onClick={onClick}
    >
      <p>{label}</p>
      <Text.formatted rule={rule} copyable={copyable} onCopy={onCopy}>
        {value || "-"}
      </Text.formatted>
    </div>
  );
};

const ConvertMobileItem: React.FC<ConvertMobileItemProps> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

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
              modal.show(ConverHistoryItemDetailsDialog, {
                item,
                chainsInfo: props.chainsInfo,
              });
            }}
          >
            {t("portfolio.overview.column.convert.details")}
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
        <ConvertMobileField
          label={t("portfolio.overview.column.convert.usdcAmount")}
          value={item.received_qty}
        />
        <ConvertMobileField label={t("common.fee")} value={totalHaircut} />
        <ConvertMobileField
          label={t("portfolio.overview.column.convert.convertId")}
          value={item.convert_id}
          copyable={true}
        />
        <ConvertMobileField
          label={t("common.type")}
          value={item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
        />
        <ConvertMobileField
          label={t("common.status")}
          value={item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
        />
      </div>
    </div>
  );
};

type ConvertHistoryItemDetailsDialogProps = {
  item: ConvertRecord;
  chainsInfo: any[];
};

const ConverHistoryItemDetailsDialog =
  modal.create<ConvertHistoryItemDetailsDialogProps>((props) => {
    const { item, chainsInfo } = props;
    const { t } = useTranslation();
    const { visible, hide, resolve, reject, onOpenChange } = useModal();

    return (
      <SimpleSheet
        title={t("portfolio.overview.convert.dialog.title.details")}
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
                    label={t("common.qty")}
                    value={detail.converted_qty}
                  />
                  <ConvertMobileField
                    label={t("portfolio.overview.column.convert.usdcAmount")}
                    value={detail.received_qty}
                  />
                  <ConvertMobileField label="Fee" value={detail.haircut} />
                  <ConvertMobileField
                    label={t("common.txId")}
                    copyable={!!detail.tx_id}
                    rule="txId"
                    value={detail.tx_id}
                    onClick={() => {
                      if (detail.tx_id) {
                        const chainInfo = chainsInfo.find(
                          (item) => item.chain_id == detail.chain_id,
                        );
                        if (chainInfo?.explorer_base_url) {
                          window.open(
                            `${chainInfo.explorer_base_url}/tx/${detail.tx_id}`,
                            "_blank",
                          );
                        }
                      }
                    }}
                  />
                  <ConvertMobileField
                    label={t("transfer.network")}
                    value={
                      chainsInfo.find(
                        (item) => item.chain_id == detail.chain_id,
                      )?.name || "-"
                    }
                  />
                  <ConvertMobileField
                    label={t("common.result")}
                    value={
                      detail.result
                        ? detail.result.charAt(0).toUpperCase() +
                          detail.result.slice(1)
                        : "-"
                    }
                  />
                </div>
              </div>
              {index < item.details.length - 1 && <Divider />}
            </>
          ))}
        </div>
      </SimpleSheet>
    );
  });
