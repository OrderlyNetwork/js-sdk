import { FC } from "react";
import { cn, useScreen } from "@orderly.network/ui";
import { AllVaultsWidget } from "../components/all-vaults/all-vaults.widget";
import { VaultsProvider } from "../components/provider/vaults-provider";
import { VaultsHeaderWidget } from "../components/vaults-header";
import { VaultsIntroductionWidget } from "../components/vaults-introduction";
import { VaultsPageConfig } from "../types/vault";

export type VaultsPageProps = {
  className?: string;
  config?: VaultsPageConfig;
};

export const VaultsPage: FC<VaultsPageProps> = (props) => {
  const { isMobile } = useScreen();
  return (
    <VaultsProvider {...props}>
      <div
        className={cn(
          "oui-relative oui-min-h-screen ",
          "oui-bg-base-10",
          isMobile ? "oui-px-3 oui-py-6" : "oui-px-6 oui-py-12",
          props?.className,
        )}
      >
        <div
          id="vaults-content"
          className={cn(
            "oui-mx-auto oui-flex oui-max-w-[1200px] oui-flex-col",
            isMobile ? "oui-gap-6" : "oui-gap-12",
          )}
        >
          <VaultsHeaderWidget />
          <VaultsIntroductionWidget />
          <AllVaultsWidget />
        </div>
      </div>
    </VaultsProvider>
  );
};
