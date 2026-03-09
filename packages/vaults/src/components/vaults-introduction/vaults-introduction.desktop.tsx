import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text, Divider, cn, TextProps, useScreen } from "@orderly.network/ui";
import { VaultsIntroductionScript } from "./vaults-introduction.script";

export const VaultsIntroductionDesktop: FC<VaultsIntroductionScript> = (
  props,
) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const { vaultsInfo } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-items-center",
        "oui-bg-gradient-to-b oui-from-[rgb(var(--oui-gradient-neutral-start))] oui-to-[rgb(var(--oui-gradient-neutral-end))]",
        isMobile
          ? "oui-gap-3 oui-rounded-xl oui-p-3"
          : "oui-gap-6 oui-rounded-2xl oui-p-6",
      )}
    >
      <VaultsIntroductionItem
        title={t("vaults.introduction.tvl")}
        value={vaultsInfo.tvl}
        textProps={{ currency: "$" } as any}
        isMobile={isMobile}
      />
      <Divider
        direction="vertical"
        intensity={12}
        className={isMobile ? "oui-h-[44px]" : "oui-h-[64px]"}
      />
      <VaultsIntroductionItem
        title={t("common.vaults")}
        value={vaultsInfo.vaultsCount}
        isMobile={isMobile}
      />
      <Divider
        direction="vertical"
        intensity={12}
        className={isMobile ? "oui-h-[44px]" : "oui-h-[64px]"}
      />
      <VaultsIntroductionItem
        title={t("vaults.introduction.depositors")}
        value={vaultsInfo.lpCount}
        isMobile={isMobile}
      />
    </div>
  );
};

const VaultsIntroductionItem: FC<{
  title: string;
  value: number;
  textProps?: TextProps;
  isMobile?: boolean;
}> = (props) => {
  const { title, value, textProps, isMobile } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-flex-1 oui-flex-col oui-items-center ",
        isMobile ? "oui-gap-0.5" : "oui-gap-3",
      )}
    >
      <div
        className={cn(
          "oui-font-normal oui-text-base-contrast-54",
          isMobile ? "oui-text-2xs" : "oui-text-base",
        )}
      >
        {title}
      </div>
      <Text.numeral
        className={cn(
          "oui-font-semibold",
          isMobile ? "oui-text-base" : "oui-text-xl",
        )}
        dp={0}
        {...textProps}
      >
        {value}
      </Text.numeral>
    </div>
  );
};
