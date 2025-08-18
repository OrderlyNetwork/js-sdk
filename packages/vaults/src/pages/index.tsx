import { FC } from "react";
import { cn } from "@orderly.network/ui";
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
  return (
    <VaultsProvider {...props}>
      <div
        className={cn(
          "oui-relative oui-min-h-screen oui-px-6 oui-pt-12",
          "oui-bg-base-10",
          props?.className,
        )}
      >
        <div
          id="vaults-content"
          className="oui-mx-auto oui-flex oui-max-w-[1200px] oui-flex-col oui-gap-[48px]"
        >
          <VaultsHeaderWidget />
          <VaultsIntroductionWidget />
          <AllVaultsWidget />
        </div>
      </div>
    </VaultsProvider>
  );
};
