import { FC } from "react";
import { TitleReturns } from "./title.script";
import { Trans } from "@orderly.network/i18n";

export const Title: FC<TitleReturns> = (props) => {
  return (
    <div
      id="oui-affiliate-home-title"
      className="oui-text-3xl md:oui-text-3xl lg:oui-text-4xl xl:oui-text-5xl oui-font-bold oui-text-center"
    >
      {/* @ts-ignore */}
      <Trans
        i18nKey="affiliate.page.home.title"
        values={{
          shortBrokerName: props.shortBrokerName,
        }}
        components={[
          <span
            className="oui-gradient-brand oui-text-transparent oui-bg-clip-text"
            style={{
              // @ts-ignore
              "--oui-gradient-angle": "270deg",
            }}
          />,
        ]}
      />
    </div>
  );
};
