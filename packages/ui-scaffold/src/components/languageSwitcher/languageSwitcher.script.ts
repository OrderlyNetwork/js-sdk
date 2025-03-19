import { useState } from "react";
import { i18n } from "@orderly.network/i18n";

export type Language = {
  lang: string;
  displayName: string;
};

export const languages: Language[] = [
  { lang: "en", displayName: "English" },
  { lang: "zh-TW", displayName: "繁體中文" },
  { lang: "zh-Hans", displayName: "简体中文" },
  { lang: "tr", displayName: "Türkçe" },
  { lang: "ru", displayName: "Русский" },
  { lang: "pt-BR", displayName: "Português" },
  { lang: "uk-UA", displayName: "Українська" },
  { lang: "vi-VN", displayName: "Tiếng Việt" },
  { lang: "es-ES", displayName: "Español" },
] as const;

export type LanguageSwitcherScriptReturn = ReturnType<
  typeof useLanguageSwitcherScript
>;

export const useLanguageSwitcherScript = () => {
  const [open, setOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    i18n.language || languages[0].lang
  );

  const hide = () => {
    setOpen(false);
  };

  const onLangChange = (lang: string) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return {
    open,
    onOpenChange: setOpen,
    hide,
    languages,
    selectedLang,
    onLangChange,
  };
};
