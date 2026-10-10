import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  Input,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Text,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  DEFAULT_BINARY_QUOTE_TICK,
  parseSlippageTicks,
} from "../../binary/binaryOrderRules";

export const BinarySlippage = ({
  slippage,
  setSlippage,
  estimated,
  quoteTick = DEFAULT_BINARY_QUOTE_TICK,
}: {
  slippage: string;
  setSlippage: (value: string) => void;
  estimated: number | null;
  quoteTick?: number;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(slippage);
  const valid = parseSlippageTicks(draft) != null;
  const cents = (ticks: number) =>
    new Decimal(ticks).mul(quoteTick).mul(100).toDecimalPlaces(2).toString();
  return (
    <div className="oui-flex oui-items-center oui-justify-between oui-gap-2">
      <Text intensity={54}>{t("orderEntry.slippage")}</Text>
      <PopoverRoot
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          setDraft(slippage);
        }}
      >
        <PopoverTrigger asChild>
          <Button size="xs" variant="text" color="secondary">
            {t("orderEntry.slippage.est")}:{" "}
            {estimated == null ? "--" : cents(estimated)}¢ / {t("common.max")}:{" "}
            {cents(Number(slippage))}¢
          </Button>
        </PopoverTrigger>
        <PopoverContent className="oui-w-64 oui-space-y-3 oui-p-4" align="end">
          <Text size="xs">{t("prediction.slippageTicksHint")}</Text>
          <div className="oui-flex oui-gap-2">
            {[1, 2, 5].map((ticks) => (
              <Button
                key={ticks}
                size="xs"
                variant={draft === String(ticks) ? "contained" : "outlined"}
                onClick={() => setDraft(String(ticks))}
              >
                {cents(ticks)}¢
              </Button>
            ))}
          </div>
          <Input
            aria-label={t("prediction.slippageTicks")}
            value={draft}
            onValueChange={setDraft}
          />
          {!valid && (
            <Text size="xs" color="danger">
              {t("prediction.invalidSlippageTicks")}
            </Text>
          )}
          <div className="oui-flex oui-justify-end oui-gap-2">
            <Button size="xs" variant="outlined" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="xs"
              disabled={!valid}
              onClick={() => {
                setSlippage(draft);
                setOpen(false);
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
};
