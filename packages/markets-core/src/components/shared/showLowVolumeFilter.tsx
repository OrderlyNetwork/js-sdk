import { useId } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Checkbox, cn, Switch, Tips, useScreen } from "@orderly.network/ui";
import { useLowVolumeMarketFilter } from "./lowVolumeMarketFilter";

export const ShowLowVolumeFilter = ({ className }: { className?: string }) => {
  const id = useId();
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const { showLowVolume, setShowLowVolume } = useLowVolumeMarketFilter();

  const tooltipContent = t("markets.strictVolumeFilter.tooltip");
  return (
    <div
      className={cn(
        "oui-markets-lowVolumeFilter oui-flex oui-shrink-0 oui-items-center oui-gap-x-1",
        className,
      )}
    >
      <label
        htmlFor={id}
        className="oui-inline-flex oui-size-4 oui-shrink-0 oui-cursor-pointer oui-items-center oui-justify-center"
      >
        <Checkbox
          id={id}
          aria-label={t("markets.strictVolumeFilter")}
          checked={!showLowVolume}
          onCheckedChange={(checked) => setShowLowVolume(checked !== true)}
        />
      </label>
      <Tips
        title={t("common.tips")}
        content={isMobile ? <StrictModeTipsContent /> : tooltipContent}
        className="oui-inline-flex"
        trigger={
          <span
            className="oui-cursor-pointer oui-select-none oui-whitespace-nowrap oui-border-b oui-border-dashed oui-border-line-12 oui-text-xs oui-text-base-contrast-54"
            onClick={
              isMobile ? undefined : () => setShowLowVolume(!showLowVolume)
            }
          >
            {t("markets.strictVolumeFilter")}
          </span>
        }
      />
    </div>
  );
};

const StrictModeTipsContent = () => {
  const id = useId();
  const { t } = useTranslation();
  const { showLowVolume, setShowLowVolume } = useLowVolumeMarketFilter();

  return (
    <div className="oui-flex oui-w-full oui-flex-col oui-gap-4">
      <div className="oui-text-base-contrast-54">
        {t("markets.strictVolumeFilter.tooltip")}
      </div>
      <div className="oui-flex oui-items-center oui-justify-between oui-gap-4">
        <label
          htmlFor={id}
          className="oui-cursor-pointer oui-text-base-contrast"
        >
          {t("markets.strictVolumeFilter.mode")}
        </label>
        <Switch
          id={id}
          checked={!showLowVolume}
          onCheckedChange={(checked) => setShowLowVolume(!checked)}
        />
      </div>
    </div>
  );
};
