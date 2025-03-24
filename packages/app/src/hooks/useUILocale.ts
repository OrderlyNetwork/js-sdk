import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Locale } from "@orderly.network/ui";

export function useUILocale(localeCode = "en") {
  const { t } = useTranslation();

  return useMemo<Locale>(() => {
    return {
      locale: localeCode,
      dialog: {
        ok: t("common.ok"),
        cancel: t("common.cancel"),
      },
      modal: {
        confirm: t("common.confirm"),
        cancel: t("common.cancel"),
      },
      pagination: {
        morePages: t("ui.pagination.morePages"),
        rowsPerPage: t("ui.pagination.rowsPerPage"),
      },
      picker: {
        selectDate: t("ui.picker.selectDate"),
      },
      empty: {
        description: t("ui.empty.description"),
      },
    } as const;
  }, [t]);
}
