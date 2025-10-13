import React from "react";
import {
  LocaleProvider as I18nLocaleProvider,
  LocaleCode,
  LocaleEnum,
  removeLangPrefix,
} from "@kodiak-finance/orderly-i18n";
import { resources } from "../../../components/orderlyProvider/localeProvider";

export const LocaleProvider: React.FC<React.PropsWithChildren> = (props) => {
  const onLanguageChanged = async (lang: LocaleCode) => {
    const path = removeLangPrefix(window.location.pathname);
    window.history.replaceState({}, "", `/${lang}${path}`);
  };

  const loadPath = (lang: LocaleCode) => {
    if (lang === LocaleEnum.en) {
      // because en is built-in, we need to load the en extend only
      return `/locales/extend/${lang}.json`;
    }
    return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  return (
    <I18nLocaleProvider
      resources={resources}
      onLanguageChanged={onLanguageChanged}
      backend={{ loadPath }}
    >
      {props.children}
    </I18nLocaleProvider>
  );
};
