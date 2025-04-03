import { FC, ReactNode, useEffect, useState } from "react";
import { I18nextProvider, type I18nextProviderProps } from "react-i18next";
import i18n from "./i18n";
import { Language, LocaleContext } from "./context";
import { defaultLanguages, defaultNS } from "./constant";
import { LocaleCode, Resources } from "./types";

export type I18nProviderProps = Partial<I18nextProviderProps>;

export const I18nProvider: FC<I18nProviderProps> = (props) => {
  const { children, ...rest } = props;
  return (
    // @ts-ignore
    <I18nextProvider {...rest}>{props.children}</I18nextProvider>
  );
};

export type LocaleProviderProps = {
  children: ReactNode;
  locale?: LocaleCode;
  resource?: Record<string, string>;
  resources?: Resources;

  /**
   * custom languages
   */
  languages?: Language[];
  /**
   * supported languages, you can select supported languages from default languages
   */
  supportedLanguages?: LocaleCode[];
  onLocaleChange?: (locale: LocaleCode) => void;
};

export const LocaleProvider: FC<LocaleProviderProps> = (props) => {
  const { locale, resource, resources } = props;
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);

  useEffect(() => {
    // init with resources
    if (resources) {
      Object.entries(resources).forEach(([locale, messages]) => {
        i18n.addResourceBundle(locale, defaultNS, messages, true, true);
      });
      return;
    }

    // init with locale and resource
    if (resource) {
      const lng = locale || i18n.language;
      i18n.addResourceBundle(lng, defaultNS, resource, true, true);
    }
  }, [locale, resource, resources]);

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

  useEffect(() => {
    const handleLanguageChange = (lng: LocaleCode) => {
      props?.onLocaleChange?.(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  return (
    <LocaleContext.Provider value={{ languages }}>
      {/* @ts-ignore */}
      <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
        {props.children}
      </I18nextProvider>
    </LocaleContext.Provider>
  );
};
