import { useState } from "react";
import { i18n, useLocaleContext } from "@orderly.network/i18n";
import { useTrack } from "@orderly.network/hooks";
import { EnumTrackerKeys } from "@orderly.network/types";

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

  const onLangChange = async (lang: string) => {
    setLoading(true);
    setSelectedLang(lang);
    await onLanguageBeforeChanged(lang);
    await i18n.changeLanguage(lang);
    await onLanguageChanged(lang);
    setOpen(false);
    setLoading(false);
    track(EnumTrackerKeys.switchLanguage, {
      language: lang,
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
