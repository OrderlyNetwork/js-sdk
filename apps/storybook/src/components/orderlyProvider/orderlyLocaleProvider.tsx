import type { FC, PropsWithChildren } from "react";
import {
  LocaleProvider,
  LocaleProviderProps,
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

export type OrderlyLocaleProviderProps = PropsWithChildren<
  Pick<LocaleProviderProps, "onLanguageChanged">
>;

export const OrderlyLocaleProvider: FC<OrderlyLocaleProviderProps> = (
  props,
) => {
  return (
    <LocaleProvider
      onLanguageChanged={props.onLanguageChanged}
      resources={resources}
    >
      {props.children}
    </LocaleProvider>
  );
};
