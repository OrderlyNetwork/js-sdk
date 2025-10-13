import {
  LocaleProvider as I18nLocaleProvider,
  LocaleCode,
  Resources,
} from "@kodiak-finance/orderly-i18n";
import de from "@kodiak-finance/orderly-i18n/locales/de.json";
import es from "@kodiak-finance/orderly-i18n/locales/es.json";
import fr from "@kodiak-finance/orderly-i18n/locales/fr.json";
import id from "@kodiak-finance/orderly-i18n/locales/id.json";
import it from "@kodiak-finance/orderly-i18n/locales/it.json";
import ja from "@kodiak-finance/orderly-i18n/locales/ja.json";
import ko from "@kodiak-finance/orderly-i18n/locales/ko.json";
import nl from "@kodiak-finance/orderly-i18n/locales/nl.json";
import pl from "@kodiak-finance/orderly-i18n/locales/pl.json";
import pt from "@kodiak-finance/orderly-i18n/locales/pt.json";
import ru from "@kodiak-finance/orderly-i18n/locales/ru.json";
import tr from "@kodiak-finance/orderly-i18n/locales/tr.json";
import uk from "@kodiak-finance/orderly-i18n/locales/uk.json";
import vi from "@kodiak-finance/orderly-i18n/locales/vi.json";
import zh from "@kodiak-finance/orderly-i18n/locales/zh.json";

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