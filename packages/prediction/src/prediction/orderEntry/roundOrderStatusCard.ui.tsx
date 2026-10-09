import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { CaretDownIcon, CaretUpIcon, Spinner, cn } from "@orderly.network/ui";
import type { PredictionState } from "../prediction.script";
import { usePredictionFormatters } from "../predictionShared";

export const RoundOrderStatusCard: React.FC<
  Pick<PredictionState, "round" | "roundPhase" | "isRoundInSnapshot"> & {
    restricted?: boolean;
    marketName: string;
    intervalSeconds: number;
  }
> = ({
  round,
  roundPhase,
  isRoundInSnapshot,
  restricted,
  marketName,
  intervalSeconds,
}) => {
  const { t } = useTranslation();
  const { formatRoundWindow } = usePredictionFormatters();
  // "closed" covers both waiting-for-result and out-of-snapshot rounds —
  // deriveBinaryPhase never produces any other pre-resolution terminal.
  const isResolving = roundPhase === "closed";
  const resolvedOutcome =
    roundPhase === "resolvedUp"
      ? "up"
      : roundPhase === "resolvedDown"
        ? "down"
        : null;

  return (
    <section
      className={cn(
        "oui-flex oui-h-full oui-min-h-[360px] oui-flex-col oui-items-center oui-justify-center oui-rounded-xl oui-bg-base-9 oui-p-6 oui-text-center md:oui-h-auto",
        restricted && "oui-flex-1 2xl:oui-flex-none",
      )}
    >
      {restricted && (
        <div role="status">
          <h2 className="oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.region.restrictedTitle")}
          </h2>
          <p className="oui-mt-4 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.region.restrictedDescription")}
          </p>
        </div>
      )}
      {!restricted && isResolving && (
        <>
          {isRoundInSnapshot ? (
            <>
              <Spinner size="lg" color="primary" />
              <h2 className="oui-mt-6 oui-text-lg oui-font-semibold oui-text-base-contrast">
                {t("prediction.resolution.determiningWinner")}
              </h2>
              <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
                {marketName} · {formatRoundWindow(round, intervalSeconds)}
              </p>
              <p className="oui-mt-5 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
                {t("prediction.resolution.pendingDescription")}
              </p>
            </>
          ) : (
            // Round outside the 300-row snapshot: per the API spec this means
            // "not queryable right now", not that settlement finished.
            <div role="status">
              <h2 className="oui-text-lg oui-font-semibold oui-text-base-contrast">
                {marketName}
              </h2>
              <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
                {t("prediction.notInSnapshot")}
              </p>
            </div>
          )}
        </>
      )}

      {!restricted && resolvedOutcome && (
        <>
          <div
            className={cn(
              "oui-flex oui-size-16 oui-items-center oui-justify-center oui-rounded-full",
              resolvedOutcome === "up"
                ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                : "oui-bg-trade-loss/15 oui-text-trade-loss",
            )}
          >
            {resolvedOutcome === "up" ? (
              <CaretUpIcon size={32} color="inherit" opacity={1} />
            ) : (
              <CaretDownIcon size={32} color="inherit" opacity={1} />
            )}
          </div>
          <h2
            className={cn(
              "oui-mt-5 oui-text-lg oui-font-semibold",
              resolvedOutcome === "up"
                ? "oui-text-trade-profit"
                : "oui-text-trade-loss",
            )}
          >
            {t("prediction.resolution.outcome", {
              outcome: t(`prediction.${resolvedOutcome}`),
            })}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {marketName} · {formatRoundWindow(round, intervalSeconds)}
          </p>
        </>
      )}
    </section>
  );
};
