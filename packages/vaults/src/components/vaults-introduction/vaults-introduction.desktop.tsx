import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text, Divider, cn, TextProps } from "@orderly.network/ui";
import { VaultsIntroductionScript } from "./vaults-introduction.script";

export const VaultsIntroductionDesktop: FC<VaultsIntroductionScript> = (
  props,
) => {
  const { t } = useTranslation();
  const { vaultsInfo } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-items-center oui-gap-6 oui-rounded-2xl oui-p-6",
        // "oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-primary-end)/0.12)] oui-to-[rgba(var(--oui-gradient-primary-start)/0.12)]"
        // "oui-via-21.6% oui-via-83.23% oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-neutral-end)/1)] oui-to-[rgba(var(--oui-gradient-neutral-start)/1)]"
      )}
      style={{
        background: "linear-gradient(28.29deg, #1B1D22 21.6%, #26292E 83.23%)",
      }}
    >
      <VaultsIntroductionItem
        title={t("vaults.introduction.tvl")}
        value={vaultsInfo.tvl}
        textProps={{ currency: "$" } as any}
      />
      <Divider
        direction="vertical"
        className="oui-h-[64px] oui-bg-white/[0.12]"
      />
      <VaultsIntroductionItem
        title={t("common.vaults")}
        value={vaultsInfo.vaultsCount}
      />
      <Divider
        direction="vertical"
        className="oui-h-[64px] oui-bg-white/[0.12]"
      />
      <VaultsIntroductionItem
        title={t("vaults.introduction.depositors")}
        value={vaultsInfo.lpCount}
      />
    </div>
  );
};

const VaultsIntroductionItem: FC<{
  title: string;
  value: number;
  textProps?: TextProps;
}> = (props) => {
  const { title, value, textProps } = props;

  return (
    <div className="oui-flex oui-flex-1 oui-flex-col oui-items-center oui-gap-3 oui-rounded-2xl">
      <div className="oui-text-base oui-font-normal oui-text-base-contrast-54">
        {title}
      </div>
      <Text.numeral dp={0} {...textProps}>
        {value}
      </Text.numeral>
    </div>
  );
};
