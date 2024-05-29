import { FC, PropsWithChildren, useMemo } from "react";
import { IntlProvider, IntlConfig } from "react-intl";
import { en, EN } from "./locale/en-US";

type LocalState = Partial<
  Pick<IntlConfig, "messages">
>;

export const LocalProvider: FC<LocalState & PropsWithChildren> = (props) => {
  const { messages } = props;
  const locale = "en", defaultLocale = "en";

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
      {props.children as any}
    </IntlProvider>
  );
};
