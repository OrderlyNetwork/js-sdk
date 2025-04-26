import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { I18nextProvider, type I18nextProviderProps } from "react-i18next";
import i18n from "./i18n";
import { Language, LocaleContext, LocaleContextState } from "./context";
import { defaultLanguages, defaultNS } from "./constant";
import { LocaleCode, Resources } from "./types";
import { Backend, BackendOptions } from "./backend";
import { parseI18nLang } from "./utils";

export type I18nProviderProps = Partial<I18nextProviderProps>;

export const I18nProvider: FC<I18nProviderProps> = (props) => {
  const { children, ...rest } = props;
  return (
    // @ts-ignore
    <I18nextProvider {...rest}>{children}</I18nextProvider>
  );
};

export type LocaleProviderProps = {
  children: ReactNode;
  locale?: LocaleCode;
  resource?: Record<string, string>;
  resources?: Resources;
  /**
   * supported languages, you can select supported languages from default languages
   */
  supportedLanguages?: LocaleCode[];
  /**
   * @deprecated use onLanguageChanged instead, will be removed in next patch version
   */
  onLocaleChange?: (locale: LocaleCode) => void;
  /** optional conversion function to use to modify the detected language code */
  convertDetectedLanguage?: (lang: string) => LocaleCode;
  backend?: BackendOptions;
} & Partial<LocaleContextState>;

export const LocaleProvider: FC<LocaleProviderProps> = (props) => {
  const { locale, resource, resources, convertDetectedLanguage } = props;
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const backend = useRef(new Backend(props.backend!));

  useEffect(() => {
    // init with resources
    if (resources) {
      Object.entries(resources).forEach(([locale, messages]) => {
        i18n.addResourceBundle(locale, defaultNS, messages, true, true);
      });
      return;
    }

    // init with locale and resource
    if (resource && locale) {
      i18n.addResourceBundle(locale, defaultNS, resource, true, true);
    }
  }, [locale, resource, resources]);

  useEffect(() => {
    // change language when locale changed
    if (locale && locale !== i18n.language) {
      i18n.changeLanguage(locale);
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
    // init language when refresh page
    const initLanguage = async () => {
      const lang =
        typeof convertDetectedLanguage === "function"
          ? convertDetectedLanguage(i18n.language)
          : parseI18nLang(i18n.language);
      await backend.current.loadLanguage(lang, defaultNS);
      // if browser language is not a valid language, change language
      if (lang !== i18n.language) {
        await i18n.changeLanguage(lang);
      }
    };

    initLanguage();
  }, [i18n.language]);

  const onLanguageBeforeChanged = async (lang: LocaleCode) => {
    await props.onLanguageBeforeChanged?.(lang);
    // load language when language before changed
    await backend.current.loadLanguage(lang, defaultNS);
  };

  const onLanguageChanged = async (lang: LocaleCode) => {
    props.onLanguageChanged?.(lang);
    props.onLocaleChange?.(lang);
  };

  return (
    <LocaleContext.Provider
      value={{ languages, onLanguageBeforeChanged, onLanguageChanged }}
    >
      {/* @ts-ignore */}
      <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
        {props.children}
      </I18nextProvider>
    </LocaleContext.Provider>
  );
};
