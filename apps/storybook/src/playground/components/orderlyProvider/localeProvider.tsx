import { FC, ReactNode, useMemo } from "react";
import {
  LocaleProvider as I18nLocaleProvider,
  LocaleCode,
  LocaleEnum,
  removeLangPrefix,
  LocaleProviderProps,
} from "@orderly.network/i18n";
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
    if (lang === LocaleEnum.en) {
      // because en is built-in, we need to load the en extend only
      return `/locales/extend/${lang}.json`;
    }
    return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  const localeProps = useMemo(() => {
    const params = {} as Partial<LocaleProviderProps>;
    if (asyncLoadLocale) {
      params.backend = { loadPath };
    } else {
      params.resources = resources;
    }
    return params;
  }, [asyncLoadLocale]);

  return (
    <I18nLocaleProvider
      onLanguageChanged={onLanguageChanged}
      // resources={resources}
      // backend={{ loadPath }}
      {...localeProps}
    >
      {props.children}
    </I18nLocaleProvider>
  );
};
