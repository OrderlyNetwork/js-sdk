import { useMemo, useState } from "react";
import { useTrack } from "@orderly.network/hooks";
import {
  i18n,
  LocaleContextState,
  useLocaleContext,
} from "@orderly.network/i18n";
import { TrackerEventName } from "@orderly.network/types";
import { useScreen } from "@orderly.network/ui";

export type LanguageSwitcherScriptReturn = ReturnType<
  typeof useLanguageSwitcherScript
>;
export type LanguageSwitcherScriptOptions = Pick<LocaleContextState, "popup">;

export const useLanguageSwitcherScript = (
  options?: LanguageSwitcherScriptOptions,
) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const { languages, onLanguageBeforeChanged, onLanguageChanged, popup } =
    useLocaleContext();

  const { track, setIdentify } = useTrack();

  const { isMobile } = useScreen();

  const onLangChange = async (lang: string, displayName: string) => {
    setLoading(true);
    setSelectedLang(lang);
    await onLanguageBeforeChanged(lang);
    await i18n.changeLanguage(lang);
    await onLanguageChanged(lang);
    setOpen(false);
    setLoading(false);
    track(TrackerEventName.switchLanguage, {
      language: displayName,
      language_code: lang,
    });

    setIdentify({
      language_code: lang,
    });
  };

  const _popup = useMemo(
    () => ({
      ...popup,
      ...options?.popup,
      mode:
        options?.popup?.mode || popup?.mode || (isMobile ? "sheet" : "modal"),
    }),
    [popup, options?.popup, isMobile],
  );

  return {
    open,
    onOpenChange: setOpen,
    languages,
    selectedLang,
    onLangChange,
    loading,
    popup: _popup,
  };
};
