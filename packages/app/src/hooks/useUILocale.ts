import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Locale } from "@orderly.network/ui";

export function useUILocale(localeCode = "en") {
  const { t } = useTranslation();

  return useMemo<Locale>(() => {
    return {
      locale: localeCode,
      dialog: {
        ok: t("ui.dialog.ok"),
        cancel: t("ui.dialog.cancel"),
      },
      modal: {
        confirm: t("ui.modal.confirm"),
        cancel: t("ui.modal.cancel"),
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
