import { useEffect, useState } from "react";
import i18n from "./i18n";
import { LocaleCode } from "./localization";

export function useLocaleCode() {
  const [loacaleCode, setLoacaleCode] = useState<LocaleCode>(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng: LocaleCode) => {
      setLoacaleCode(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  return loacaleCode;
}
