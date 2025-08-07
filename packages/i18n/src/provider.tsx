import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { I18nextProvider, type I18nextProviderProps } from "react-i18next";
import { Backend, BackendOptions } from "./backend";
import { defaultLanguages, defaultNS } from "./constant";
import { Language, LocaleContext, LocaleContextState } from "./context";
import i18n from "./i18n";
import { LocaleCode, Resources } from "./types";
import { parseI18nLang } from "./utils";

export type I18nProviderProps = Partial<I18nextProviderProps>;

export const I18nProvider: React.FC<I18nProviderProps> = (props) => {
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

export const LocaleProvider: React.FC<LocaleProviderProps> = (props) => {
  const {
    children,
    locale,
    resource,
    resources,
    backend,
    popup,
    supportedLanguages,
    onLanguageChanged,
    convertDetectedLanguage,
    onLanguageBeforeChanged,
    onLocaleChange,
  } = props;

  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);

  const backendRef = useRef(new Backend(backend!));

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
    } else if (Array.isArray(supportedLanguages)) {
      setLanguages(
        supportedLanguages
          .map((localCode) =>
            defaultLanguages.find((l) => l.localCode === localCode),
          )
          .filter((item) => !!item),
      );
    }
  }, [supportedLanguages, props.languages]);

  useEffect(() => {
    // init language when refresh page
    const initLanguage = async () => {
      const lang =
        typeof convertDetectedLanguage === "function"
          ? convertDetectedLanguage(i18n.language)
          : parseI18nLang(i18n.language);
      await backendRef.current.loadLanguage(lang, defaultNS);
      // if browser language is not a valid language, change language
      if (lang !== i18n.language) {
        await i18n.changeLanguage(lang);
      }
    };

    initLanguage();
  }, [i18n.language]);

  const languageBeforeChangedHandle = useCallback(
    async (lang: LocaleCode) => {
      await onLanguageBeforeChanged?.(lang);
      // load language when language before changed
      await backendRef.current.loadLanguage(lang, defaultNS);
    },
    [onLanguageBeforeChanged],
  );

  const languageChangedHandle = useCallback(
    async (lang: LocaleCode) => {
      onLanguageChanged?.(lang);
      onLocaleChange?.(lang);
    },
    [onLanguageChanged, onLocaleChange],
  );

  const memoizedValue = useMemo<LocaleContextState>(() => {
    return {
      popup: popup,
      languages: languages,
      onLanguageBeforeChanged: languageBeforeChangedHandle,
      onLanguageChanged: languageChangedHandle,
    };
  }, [popup, languages, languageBeforeChangedHandle, languageChangedHandle]);

  return (
    <LocaleContext.Provider value={memoizedValue}>
      <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
        {children}
      </I18nextProvider>
    </LocaleContext.Provider>
  );
};
