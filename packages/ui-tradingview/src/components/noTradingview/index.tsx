import React, { ReactNode } from "react";

const Link = ({ url, children }: { url: string; children: ReactNode }) => {
  return (
    <span
      onClick={() => {
        window.open(url);
      }}
      className="oui-text-primary-light"
    >
      {children}
    </span>
  );
};


export function NoTradingview() {
  return (
    <div
      className="oui-z-0 oui-text-base-contrast-80 oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-bottom-0 oui-flex oui-flex-col oui-justify-center oui-items-center oui-p-5 md:oui-p-10">
      <div>
        <p className="oui-mb-6">
          Due to TradingView&apos;s policy, you will need to apply for your
          own license.
        </p>

        <p className="oui-mb-3 oui-pl-2">
          1.&nbsp;Please apply for your TradingView license{" "}
          <Link url="">here</Link>.
        </p>
        <p className="oui-pl-2">
          2.&nbsp;Follow the instructions on{" "}
          <Link url="">sdk.orderly.network</Link> to set up.
        </p>
      </div>
    </div>
  )
}