import React from "react";
import { i18n } from "@orderly.network/i18n";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { localKey } from "../provider/overviewProvider";
import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { PerformanceMobileUI } from "./performance.ui";

export const PerformanceMobileWidget: React.FC = () => {
  const state = useAssetsHistoryData(localKey, { isRealtime: true });
  return <PerformanceMobileUI {...state} />;
};

export const PerformanceMobileSheetId = "PerformanceMobileSheetId";

export const PerformanceMobileDialogId = "PerformanceMobileDialogId";

registerSimpleSheet(PerformanceMobileSheetId, PerformanceMobileWidget, {
  title: () => i18n.t("portfolio.overview.performance"),
});

registerSimpleDialog(PerformanceMobileDialogId, PerformanceMobileWidget, {
  title: () => i18n.t("portfolio.overview.performance"),
  classNames: {
    content: "oui-w-[420px]",
  },
});
