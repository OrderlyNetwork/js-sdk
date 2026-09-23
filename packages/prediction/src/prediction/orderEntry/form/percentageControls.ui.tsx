import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Slider, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export type PercentageControlsProps = {
  percentage: number;
  onPercentageChange: (percentage: number) => void;
  available?: number;
  showQuickButtons?: boolean;
  showAvailable?: boolean;
  color?: "primary" | "buy" | "sell";
  disabled?: boolean;
  /** Trailing content instead of available (e.g. TradePanel max button). */
  trailing?: React.ReactNode;
};

export const PercentageControls: React.FC<PercentageControlsProps> = ({
  percentage,
  onPercentageChange,
  available,
  showQuickButtons = false,
  showAvailable = false,
  color = "primary",
  disabled = false,
  trailing,
}) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-w-full oui-flex-col oui-gap-2">
      {showQuickButtons && (
        <div className="oui-flex oui-w-full oui-gap-2">
          {[25, 50, 75, 100].map((value) => (
            <Button
              key={value}
              variant="outlined"
              size="xs"
              color="secondary"
              disabled={disabled}
              className={cn(
                "oui-w-1/4",
                percentage === value && "oui-border-primary oui-text-primary",
              )}
              onClick={() => onPercentageChange(value)}
            >
              {value}%
            </Button>
          ))}
        </div>
      )}
      <Slider
        showTip
        markCount={4}
        min={0}
        max={100}
        step={1}
        color={color}
        disabled={disabled}
        tipFormatter={(value) => `${Math.round(value)}%`}
        value={[percentage]}
        onValueChange={([value]) => onPercentageChange(value)}
      />
      <div className="oui-flex oui-w-full oui-items-center oui-justify-between">
        {color === "primary" ? (
          <Text size="2xs" color="primary">
            {new Decimal(percentage).toDecimalPlaces(2).toNumber()}%
          </Text>
        ) : (
          <Text.numeral
            size="2xs"
            color={color}
            dp={2}
            padding={false}
            suffix="%"
          >
            {percentage}
          </Text.numeral>
        )}
        {trailing ??
          (showAvailable && available !== undefined ? (
            <div className="oui-flex oui-items-center oui-gap-1">
              <Text size="2xs" intensity={54}>
                {t("common.available")}
              </Text>
              <Text.numeral intensity={54} size="2xs" dp={4} padding={false}>
                {available}
              </Text.numeral>
            </div>
          ) : null)}
      </div>
    </div>
  );
};
