import { LocaleContextState } from "@orderly.network/i18n";
import { useLanguageSwitcherScript } from "./languageSwitcher.script";
import { LanguageSwitcher } from "./languageSwitcher.ui";

export type LanguageSwitcherWidgetProps = Pick<LocaleContextState, "popup"> & {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export const LanguageSwitcherWidget = (props: LanguageSwitcherWidgetProps) => {
  const state = useLanguageSwitcherScript(props);
  return <LanguageSwitcher {...state} />;
};
