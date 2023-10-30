import { FC, PropsWithChildren, useMemo } from "react";
import { IntlProvider, IntlConfig } from "react-intl";
import { en, EN } from "./locale/en-US";

type LocalState = Partial<
  Pick<IntlConfig, "locale" | "messages" | "defaultLocale">
>;

export const LocalProvider: FC<LocalState & PropsWithChildren> = (props) => {
  const { messages, locale = "en", defaultLocale = "en" } = props;

  const mergeMsgs: EN = useMemo(() => {
    return {
      ...en,
      ...messages,
    };
  }, [messages, locale, defaultLocale]);

  return (
    <IntlProvider
      messages={mergeMsgs}
      locale={locale}
      defaultLocale={defaultLocale}
    >
      {props.children}
    </IntlProvider>
  );
};
