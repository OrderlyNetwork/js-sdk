import React, { ReactNode } from "react";

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
  return (
    <div
      className="oui-z-0 oui-text-base-contrast-80 oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-bottom-0 oui-flex oui-flex-col oui-justify-start md:oui-justify-center oui-items-center oui-p-2 md:oui-p-10">
      <div>
        <p className="oui-mb-6 oui-text-xs">
          Due to TradingView&apos;s policy, you will need to apply for your
          own license.
        </p>

        <p className="oui-mb-3 oui-text-2xs md:oui-text-xs oui-text-base-contrast-54 md:oui-text-base-contrast-80 md:oui-text-base oui-pl-0 md:oui-pl-2">
          1.&nbsp;Please apply for your TradingView Advanced Chart license&nbsp;
          <Link url="https://www.tradingview.com/advanced-charts">here</Link>.
        </p>
        <p className="oui-pl-0 oui-text-2xs md:oui-text-xs oui-text-base-contrast-54 md:oui-text-base-contrast-80 md:oui-text-base md:oui-pl-2">
          2.&nbsp;Follow the instructions on&nbsp;
          <Link url="https://orderly.network/docs/sdks/react/components/trading#tradingviewconfig">orderly.network</Link> to set up.
        </p>
      </div>
    </div>
  )
}