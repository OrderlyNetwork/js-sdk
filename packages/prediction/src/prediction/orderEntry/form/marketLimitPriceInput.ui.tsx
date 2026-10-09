import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Input, inputFormatter, Select } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type { PredictionOrderType } from "../../prediction.script";
import { BinarySlippage } from "./binarySlippage.ui";

export type MarketLimitPriceInputProps = {
  type: PredictionOrderType;
  onTypeChange: (type: PredictionOrderType) => void;
  price: string;
  onPriceChange: (price: string) => void;
  slippage?: string;
  setSlippage?: (value: string) => void;
  estimatedSlippage?: number | null;
  showSlippage?: boolean;
  quoteTick?: number;
};

export const MarketLimitPriceInput: React.FC<MarketLimitPriceInputProps> = ({
  type,
  onTypeChange,
  price,
  onPriceChange,
  slippage,
  setSlippage,
  estimatedSlippage,
  showSlippage = true,
  quoteTick = 0.01,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Input.tooltip
        size="md"
        fullWidth
        autoComplete="off"
        triggerClassName="oui-w-full"
        formatters={[
          inputFormatter.numberFormatter,
          inputFormatter.dpFormatter(new Decimal(quoteTick).decimalPlaces()),
        ]}
        value={type === "market" ? "" : price}
        onValueChange={onPriceChange}
        disabled={type === "market"}
        placeholder={type === "market" ? "--" : ""}
        classNames={{
          suffix: "oui-text-base-contrast-54",
          root: "oui-w-full oui-outline-line-12 focus-within:oui-outline-line-12",
        }}
        suffix={
          <Select.options
            variant="text"
            size="md"
            classNames={{
              trigger: "oui-w-[--radix-select-content-available-width]",
            }}
            contentProps={{
              align: "end",
              className: "oui-border oui-border-line-6",
            }}
            value={type}
            options={[
              { label: t("common.limit"), value: "limit" },
              { label: t("common.market"), value: "market" },
            ]}
            onValueChange={(value) =>
              onTypeChange(value as PredictionOrderType)
            }
          />
        }
      />
      {showSlippage &&
        type === "market" &&
        slippage !== undefined &&
        setSlippage && (
          <div className="oui-mt-2">
            <BinarySlippage
              slippage={slippage}
              setSlippage={setSlippage}
              estimated={estimatedSlippage ?? null}
              quoteTick={quoteTick}
            />
          </div>
        )}
    </>
  );
};
