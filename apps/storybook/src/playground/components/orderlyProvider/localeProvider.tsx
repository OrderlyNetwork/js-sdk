import { FC, ReactNode } from "react";
import {
  LocaleProvider as I18nLocaleProvider,
  LocaleCode,
  LocaleEnum,
  removeLangPrefix,
} from "@veltodefi/i18n";
import { resources } from "../../../components/orderlyProvider/localeProvider";

export type CustomLocaleProviderProps = {
  children: ReactNode;
  asyncLoadLocale?: boolean;
};

export const LocaleProvider: FC<CustomLocaleProviderProps> = (props) => {
  const { asyncLoadLocale } = props;

  const onLanguageChanged = async (lang: LocaleCode) => {
    const path = removeLangPrefix(window.location.pathname);
    window.history.replaceState({}, "", `/${lang}${path}`);
  };

  const loadPath = (lang: LocaleCode) => {
    // when sync load locale, we only need to load the extend locale
    if (!asyncLoadLocale) {
      return `/locales/extend/${lang}.json`;
    }

    if (lang === LocaleEnum.en) {
      // because en is built-in, we need to load the en extend only
      return `/locales/extend/${lang}.json`;
    }
    return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  return (
    <I18nLocaleProvider
      onLanguageChanged={onLanguageChanged}
      resources={asyncLoadLocale ? undefined : resources}
      backend={{ loadPath }}
    >
      {props.children}
    </I18nLocaleProvider>
  );
};
