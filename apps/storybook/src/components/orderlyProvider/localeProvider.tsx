import type { FC, PropsWithChildren } from "react";
import {
  LocaleProvider as I18nLocaleProvider,
  LocaleProviderProps as I18nLocaleProviderProps,
  LocaleEnum,
  importLocaleJsonModule,
  type AsyncResources,
} from "@orderly.network/i18n";
import extendEnLocale from "../../locales/en.json";

export const resources: AsyncResources = async (lang, _ns) => {
  if (lang === LocaleEnum.en) {
    return extendEnLocale;
  }

  const [extend, base] = await Promise.all([
    importLocaleJsonModule(() => import(`../../locales/${lang}.json`)),
    importLocaleJsonModule(
      () => import(`../../../../../packages/i18n/locales/${lang}.json`),
    ),
  ]);
  return { ...base, ...extend };
};

export type LocaleProviderProps = PropsWithChildren<
  Pick<I18nLocaleProviderProps, "onLanguageChanged">
>;

export const LocaleProvider: FC<LocaleProviderProps> = (props) => {
  return (
    <I18nLocaleProvider
      onLanguageChanged={props.onLanguageChanged}
      resources={resources}
    >
      {props.children}
    </I18nLocaleProvider>
  );
};
