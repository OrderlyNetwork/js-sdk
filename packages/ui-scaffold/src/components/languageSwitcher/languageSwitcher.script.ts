import { useState } from "react";
import { useTrack, useTrackingInstance } from "@orderly.network/hooks";
import { i18n, useLocaleContext } from "@orderly.network/i18n";
import { TrackerEventName } from "@orderly.network/types";

export type LanguageSwitcherScriptReturn = ReturnType<
  typeof useLanguageSwitcherScript
>;

export const useLanguageSwitcherScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const { languages, onLanguageBeforeChanged, onLanguageChanged } =
    useLocaleContext();

  const { track } = useTrack();
  const trackInstace = useTrackingInstance();

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

    trackInstace.identify({
      language_code: lang,
    });
  };

  return {
    open,
    onOpenChange: setOpen,
    languages,
    selectedLang,
    onLangChange,
    loading,
  };
};
