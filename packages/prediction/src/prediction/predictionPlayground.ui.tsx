import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn } from "@orderly.network/ui";
import type {
  PredictionPrototypeAuthState,
  PredictionPrototypeRegionState,
  PredictionRoundPhase,
  PredictionState,
} from "./prediction.script";

export const PredictionPlayground: React.FC<
  Pick<
    PredictionState,
    | "roundPhase"
    | "setRoundPhase"
    | "roundView"
    | "setRoundView"
    | "prototypeAuthState"
    | "setPrototypeAuthState"
    | "prototypeRegionState"
    | "setPrototypeRegionState"
  >
> = ({
  roundPhase,
  setRoundPhase,
  roundView,
  setRoundView,
  prototypeAuthState,
  setPrototypeAuthState,
  prototypeRegionState,
  setPrototypeRegionState,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const phases: PredictionRoundPhase[] =
    roundView === "past"
      ? ["resolving", "resolvedUp", "resolvedDown"]
      : ["trading"];
  const authStates: PredictionPrototypeAuthState[] = [
    "disconnected",
    "connected",
    "accountReady",
    "funded",
  ];
  const regionStates: PredictionPrototypeRegionState[] = [
    "allowed",
    "restricted",
  ];

  return (
    <div className="oui-fixed oui-bottom-4 oui-end-4 oui-z-50">
      {open && (
        <div className="oui-absolute oui-bottom-14 oui-end-0 oui-max-h-[calc(100vh-88px)] oui-w-64 oui-overflow-y-auto oui-rounded-xl oui-border oui-border-line-12 oui-bg-base-5 oui-p-2 oui-shadow-xl">
          <div className="oui-px-2 oui-py-1.5 oui-text-xs oui-font-semibold oui-text-base-contrast">
            {t("prediction.playground")}
          </div>
          <div className="oui-mb-1 oui-mt-1 oui-px-2 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.roundView")}
          </div>
          <div className="oui-space-y-1">
            {(["past", "live", "future"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setRoundView(view)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  roundView === view
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.view.${view}`)}
                {roundView === view && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.round")}
          </div>
          <div className="oui-space-y-1">
            {phases.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setRoundPhase(phase)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  roundPhase === phase
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.phase.${phase}`)}
                {roundPhase === phase && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.auth")}
          </div>
          <div className="oui-space-y-1">
            {authStates.map((authState) => (
              <button
                key={authState}
                type="button"
                onClick={() => setPrototypeAuthState(authState)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  prototypeAuthState === authState
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.auth.${authState}`)}
                {prototypeAuthState === authState && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="oui-mb-1 oui-mt-3 oui-border-t oui-border-line-12 oui-px-2 oui-pt-3 oui-text-3xs oui-font-semibold oui-uppercase oui-text-base-contrast-36">
            {t("prediction.playground.region")}
          </div>
          <div className="oui-space-y-1">
            {regionStates.map((regionState) => (
              <button
                key={regionState}
                type="button"
                onClick={() => setPrototypeRegionState(regionState)}
                className={cn(
                  "oui-flex oui-w-full oui-items-center oui-justify-between oui-rounded-lg oui-px-2 oui-py-2 oui-text-start oui-text-xs oui-transition-colors",
                  prototypeRegionState === regionState
                    ? "oui-bg-base-6 oui-text-base-contrast"
                    : "oui-text-base-contrast-54 hover:oui-bg-base-6 hover:oui-text-base-contrast-80",
                )}
              >
                {t(`prediction.playground.region.${regionState}`)}
                {prototypeRegionState === regionState && (
                  <span className="oui-size-1.5 oui-rounded-full oui-bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <Button
        size="md"
        color="primary"
        className="oui-shadow-xl"
        onClick={() => setOpen((visible) => !visible)}
      >
        {t("prediction.playground")}
      </Button>
    </div>
  );
};
