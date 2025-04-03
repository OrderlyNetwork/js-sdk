import { useLanguageSwitcherScript } from "./languageSwitcher.script";
import { LanguageSwitcher } from "./languageSwitcher.ui";

export const LanguageSwitcherWidget = () => {
  const state = useLanguageSwitcherScript();
  return <LanguageSwitcher {...state} />;
};
