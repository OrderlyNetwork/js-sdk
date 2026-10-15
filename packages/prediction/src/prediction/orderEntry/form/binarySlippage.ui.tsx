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
          <Button
            size="xs"
            variant="text"
            color="secondary"
            className="oui-gap-1 oui-font-normal oui-text-base-contrast-54"
          >
            <span>{t("orderEntry.slippage.est")}:</span>
            <Text size="2xs" intensity={80}>
              {estimated == null ? "--" : cents(estimated)}¢
            </Text>
            <span>/</span>
            <span>{t("common.max")}:</span>
            <Text size="2xs" intensity={80}>
              {cents(Number(slippage))}¢
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="oui-w-[300px] oui-max-w-[calc(100vw-32px)] oui-space-y-4 oui-rounded-xl oui-p-4 oui-shadow-lg"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <div className="oui-space-y-1.5">
            <Text as="div" size="sm" weight="semibold">
              {t("orderEntry.slippage")}
            </Text>
            <Text as="p" size="xs" intensity={54} className="oui-leading-5">
              {t("prediction.slippageTicksHint")}
            </Text>
          </div>
          <div className="oui-grid oui-grid-cols-3 oui-gap-2">
            {[1, 2, 5].map((ticks) => (
              <Button
                key={ticks}
                size="md"
                color={draft === String(ticks) ? "primary" : "secondary"}
                variant={draft === String(ticks) ? "contained" : "outlined"}
                aria-pressed={draft === String(ticks)}
                onClick={() => setDraft(String(ticks))}
              >
                {cents(ticks)}¢
              </Button>
            ))}
          </div>
          <div className="oui-space-y-2">
            <Text as="div" size="xs" intensity={80}>
              {t("prediction.slippageTicks")}
            </Text>
            <Input
              aria-label={t("prediction.slippageTicks")}
              aria-invalid={!valid}
              inputMode="numeric"
              size="lg"
              fullWidth
              color={valid ? "default" : "danger"}
              classNames={{ input: "oui-font-medium" }}
              value={draft}
              onValueChange={setDraft}
            />
            {!valid && (
              <Text as="p" size="xs" color="danger" role="alert">
                {t("prediction.invalidSlippageTicks")}
              </Text>
            )}
          </div>
          <div className="oui-grid oui-grid-cols-2 oui-gap-2 oui-border-t oui-border-line-6 oui-pt-4">
            <Button
              size="md"
              variant="outlined"
              color="secondary"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="md"
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
