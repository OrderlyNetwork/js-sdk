import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { DataTableClassNames, Flex, useScreen } from "@orderly.network/ui";
import { useAssetsScript } from "./assets.script";
import type { useAssetsScriptReturn } from "./assets.script";
import { AssetsDataTable, AssetsTable } from "./assets.ui.desktop";
import { AssetsTableMobile } from "./assets.ui.mobile";

export type AssetsWidgetProps = useAssetsScriptReturn;

export type AssetsDataTableWidgetProps = {
  classNames?: {
    root?: string;
    desc?: string;
    scrollRoot?: string;
  };
  tbClassName?: string;
  dataTableClassNames?: DataTableClassNames;
};

export const AssetsDataTableWidget: React.FC<AssetsDataTableWidgetProps> = (
  props,
) => {
  const assetsState = useAssetsScript();
  const accountState = useAccount();
  return <AssetsDataTable {...assetsState} {...accountState} {...props} />;
};

export const AssetsWidget: React.FC = () => {
  const assetsState = useAssetsScript();
  const accountState = useAccount();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <AssetsTableMobile {...assetsState} {...accountState} />;
  }
  return <AssetsTable {...assetsState} {...accountState} />;
};

/**
 * Assets tab content for DataList-style panels (trading, prediction): the
 * table fills a fixed-height tab pane and scrolls inside it.
 */
export const AssetsTabWidget: React.FC = () => (
  <Flex
    width="100%"
    height="100%"
    className="oui-overflow-y-auto oui-hide-scrollbar oui-pt-3"
  >
    <AssetsDataTableWidget
      classNames={{
        scrollRoot:
          "oui-h-full oui-mb-6 oui-mt-0 oui-p-0 oui-pt-3 oui-h-[calc(100%_-_40px)]",
        root: "oui-gap-4 oui-h-full",
        desc: "oui-ms-1",
      }}
      dataTableClassNames={{
        header: "oui-bg-base-9",
        root: "oui-h-[calc(100%_-_28px)]",
      }}
    />
  </Flex>
);
