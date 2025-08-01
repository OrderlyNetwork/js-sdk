import {
  LocaleProvider as I18nLocaleProvider,
  LocaleCode,
} from "@orderly.network/i18n";
import { Resources } from "@orderly.network/i18n";
import de from "@orderly.network/i18n/locales/de.json";
import en from "@orderly.network/i18n/locales/en.json";
import es from "@orderly.network/i18n/locales/es.json";
import fr from "@orderly.network/i18n/locales/fr.json";
import id from "@orderly.network/i18n/locales/id.json";
import it from "@orderly.network/i18n/locales/it.json";
import ja from "@orderly.network/i18n/locales/ja.json";
import ko from "@orderly.network/i18n/locales/ko.json";
import nl from "@orderly.network/i18n/locales/nl.json";
import pl from "@orderly.network/i18n/locales/pl.json";
import pt from "@orderly.network/i18n/locales/pt.json";
import ru from "@orderly.network/i18n/locales/ru.json";
import tr from "@orderly.network/i18n/locales/tr.json";
import uk from "@orderly.network/i18n/locales/uk.json";
import vi from "@orderly.network/i18n/locales/vi.json";
import zh from "@orderly.network/i18n/locales/zh.json";

type ExtendLocaleMessages = typeof zh;

export const resources: Resources<ExtendLocaleMessages> = {
  zh,
  ja,
  es,
  ko,
  vi,
  de,
  fr,
  ru,
  id,
  tr,
  it,
  pt,
  uk,
  pl,
  nl,
};

export const LocaleProvider = (props: { children: React.ReactNode }) => {
  const loadPath = (lang: LocaleCode) => {
    return `/locales/extend/${lang}.json`;
    // if (lang === LocaleEnum.en) {
    //   // because en is built-in, we need to load the en extend only
    //   return `/locales/extend/${lang}.json`;
    // }
    // return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  return (
    <I18nLocaleProvider resources={resources} backend={{ loadPath }}>
      {props.children}
    </I18nLocaleProvider>
  );
};
