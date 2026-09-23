import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  Divider,
  Input,
  inputFormatter,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@orderly.network/ui";
import { OutcomeBadge } from "../../cells";
import type {
  PredictionOutcome,
  PredictionState,
} from "../../prediction.script";
import { MarketLimitPriceInput, PercentageControls } from "../form";
import { useSellPositionScript } from "./sellPosition.script";

export type SellPositionProps = {
  state: PredictionState;
  outcome: PredictionOutcome;
};

export const SellPosition: React.FC<SellPositionProps> = ({
  state,
  outcome,
}) => {
  const { t } = useTranslation();
  const sell = useSellPositionScript({ state, outcome });

  return (
    <PopoverRoot open={sell.open} onOpenChange={sell.onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={!sell.tradable || sell.available <= 0}
        >
          {t("common.sell")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="oui-w-[360px] oui-max-w-[calc(100vw-32px)] oui-p-5"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="oui-flex oui-flex-col oui-gap-2">
          <div>
            <OutcomeBadge outcome={outcome} />
          </div>
          <div className="oui-mb-1 oui-flex oui-w-full oui-items-center oui-gap-2">
            <Input.tooltip
              prefix={t("common.quantity")}
              align="right"
              size="md"
              fullWidth
              autoComplete="off"
              formatters={[
                inputFormatter.numberFormatter,
                inputFormatter.dpFormatter(4),
              ]}
              triggerClassName="oui-min-w-0 oui-flex-1"
              classNames={{
                prefix: "oui-text-base-contrast-54",
                root: "oui-w-full oui-outline-line-12",
              }}
              value={sell.quantity}
              onValueChange={sell.setQuantity}
            />
          </div>
          <PercentageControls
            percentage={sell.percentage}
            onPercentageChange={sell.selectPercentage}
            available={sell.available}
            showQuickButtons
            showAvailable
          />
          <Divider my={2} intensity={8} className="oui-w-full" />
          <MarketLimitPriceInput
            type={sell.type}
            onTypeChange={sell.setType}
            price={sell.price}
            onPriceChange={sell.setPrice}
            slippage={sell.slippage}
            setSlippage={sell.setSlippage}
            estimatedSlippage={sell.estimatedSlippage}
          />
          <div className="oui-mt-3 oui-flex oui-w-full oui-gap-2 oui-pb-1">
            <Button
              size="md"
              fullWidth
              color="secondary"
              onClick={() => sell.onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="md"
              fullWidth
              disabled={!sell.valid}
              onClick={sell.confirm}
            >
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};
