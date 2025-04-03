import { ReactNode } from "react";
import { Trans, useTranslation } from "@orderly.network/i18n";

const Link = ({ url, children }: { url: string; children: ReactNode }) => {
  return (
    <span
      onClick={() => {
        window.open(url);
      }}
      className="oui-text-primary-light oui-underline oui-cursor-pointer"
    >
      {children}
    </span>
  );
};

export function NoTradingview() {
  const { t } = useTranslation();

  return (
    <div className="oui-z-0 oui-text-base-contrast-80 oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-bottom-0 oui-flex oui-flex-col oui-justify-start md:oui-justify-center oui-items-center oui-p-2 md:oui-p-10">
      <div>
        <p className="oui-mb-6 oui-text-xs">{t("tradingView.noScriptSrc")}</p>

        <p className="oui-mb-3 oui-text-2xs md:oui-text-xs oui-text-base-contrast-54 md:oui-text-base-contrast-80 md:oui-text-base oui-pl-0 md:oui-pl-2">
          {/* @ts-ignore */}
          <Trans
            i18nKey="tradingView.noScriptSrc.1"
            components={[
              // @ts-ignore
              <Link url="https://www.tradingview.com/advanced-charts" />,
            ]}
          />
        </p>

        <p className="oui-text-2xs md:oui-text-xs oui-text-base-contrast-54 md:oui-text-base-contrast-80 md:oui-text-base oui-pl-0 md:oui-pl-2">
          {/* @ts-ignore */}
          <Trans
            i18nKey="tradingView.noScriptSrc.2"
            components={[
              // @ts-ignore
              <Link url="https://orderly.network/docs/sdks/react/components/trading#tradingviewconfig" />,
            ]}
          />
        </p>
      </div>
    </div>
  );
}
