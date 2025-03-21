import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { I18nextProvider, type I18nextProviderProps } from "react-i18next";
import i18n from "./i18n";
import { defaultNS, type LocaleMessages } from "./resources";
import { LocaleCode } from "./localization";
import {
  defaultLanguages,
  Language,
  LocaleContext,
  LocaleContextState,
} from "./context";

export type I18nProviderProps = Partial<I18nextProviderProps>;

export const I18nProvider: FC<I18nProviderProps> = (props) => {
  const { children, ...rest } = props;
  return (
    // @ts-ignore
    <I18nextProvider {...rest}>{props.children}</I18nextProvider>
  );
};

export type Resources = {
  [key in LocaleCode]?: Partial<LocaleMessages>;
};

export type LocaleProviderProps = {
  children: ReactNode;
  messages?: Record<string, string>;
  locale?: LocaleCode;
  resources?: Resources;

  /**
   * custom languages
   */
  languages?: Language[];
  /**
   * supported languages, you can select supported languages from default languages
   */
  supportedLanguages?: LocaleCode[];
};

export const LocaleProvider: FC<LocaleProviderProps> = (props) => {
  const { locale, messages, resources } = props;
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);

  useEffect(() => {
    // init with resources
    if (resources) {
      Object.entries(resources).forEach(([locale, messages]) => {
        i18n.addResourceBundle(locale, defaultNS, messages, true, true);
      });
      console.log("i18n", i18n);
      return;
    }

    // init with locale and messages
    if (messages) {
      const lng = locale || i18n.language;
      i18n.addResourceBundle(lng, defaultNS, messages, true, true);
    }
  }, [locale, messages, resources]);

  useEffect(() => {
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale, () => {
        console.log(`i18n.changeLanguage => ${i18n.language}`);
      });
    }
  }, [locale]);

  useEffect(() => {
    if (Array.isArray(props.languages)) {
      setLanguages(props.languages);
    } else if (Array.isArray(props.supportedLanguages)) {
      setLanguages(
        props.supportedLanguages
          .map((localCode) =>
            defaultLanguages.find((l) => l.localCode === localCode)
          )
          .filter((item) => !!item)
      );
    }
  }, [props.supportedLanguages, props.languages]);

  return (
    <LocaleContext.Provider value={{ languages }}>
      {/* @ts-ignore */}
      <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
        {props.children}
      </I18nextProvider>
    </LocaleContext.Provider>
  );
};
