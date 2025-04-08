import { useState } from "react";
import { i18n, useLocaleContext } from "@orderly.network/i18n";

export type LanguageSwitcherScriptReturn = ReturnType<
  typeof useLanguageSwitcherScript
>;

export const useLanguageSwitcherScript = () => {
  const [open, setOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const { languages } = useLocaleContext();

  const onLangChange = (lang: string) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return {
    open,
    onOpenChange: setOpen,
    languages,
    selectedLang,
    onLangChange,
  };
};
