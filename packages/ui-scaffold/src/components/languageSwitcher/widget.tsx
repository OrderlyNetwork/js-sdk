import { LocaleContextState } from "@orderly.network/i18n";
import { useLanguageSwitcherScript } from "./languageSwitcher.script";
import { LanguageSwitcher } from "./languageSwitcher.ui";

export type LanguageSwitcherWidgetProps = Pick<LocaleContextState, "popup">;

export const LanguageSwitcherWidget = (props: LanguageSwitcherWidgetProps) => {
  const state = useLanguageSwitcherScript();
  return <LanguageSwitcher {...state} {...props} />;
};
