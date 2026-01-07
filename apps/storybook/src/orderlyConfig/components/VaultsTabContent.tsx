import React, { useState } from "react";
import { useNavigate } from "react-router";
import { generatePath, i18n } from "@orderly.network/i18n";
import {
  SortingIcon,
  SortingAscIcon,
  SortingDescIcon,
} from "@orderly.network/ui";
import { VaultsIcon } from "../../components/icons";
import { PathEnum } from "../../playground/constant";
import { useVaultInfo } from "../hooks/useVaultInfo";
import { HeaderItem, SortConfig, SubMenuTabContent } from "./SubMenuTabContent";

export const VaultRowItem = (props: { item: any; index: number }) => {
  const { item, index } = props;
  const navigate = useNavigate();
  return (
    <div
      className="oui-flex oui-items-center oui-justify-between oui-px-1 oui-py-1.5 oui-cursor-pointer hover:oui-bg-base-7 oui-rounded-sm"
      onClick={() => {
        navigate(generatePath({ path: PathEnum.Vaults }));
      }}
    >
      <div className="oui-flex oui-items-center oui-gap-2">
        <div className="oui-w-6 oui-h-6 oui-rounded-full oui-bg-[#00a9de] oui-flex oui-items-center oui-justify-center">
          <VaultsIcon size={14} pathFill="white" pathFillOpacity={1} />
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-xs oui-font-semibold oui-text-base-contrast-80 oui-max-w-[160px] oui-break-words oui-line-clamp-2">
            {item.name}
          </div>
          <div className="oui-text-2xs oui-font-normal oui-text-base-contrast-54">
            {item.tvl}
          </div>
        </div>
      </div>
      <div className={`oui-text-2xs oui-font-bold ${item.apyColor}`}>
        {item.apy}
      </div>
    </div>
  );
};

export const VaultsTabContent = (props: {
  className?: string;
  isOpen: boolean;
}) => {
  const { className, isOpen } = props;
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const { data } = useVaultInfo(isOpen, sortConfig as any);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key !== key) {
        return { key, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { key, direction: "asc" };
      }
      return null;
    });
  };

  const headers: HeaderItem[] = [
    {
      key: "tvl",
      title: (
        <div className="oui-flex oui-items-center">
          <span className="oui-text-base-contrast-36">Name /&nbsp;</span>
          <div
            className="oui-flex oui-items-center oui-gap-1 oui-cursor-pointer hover:oui-text-base-contrast-54"
            onClick={(e) => {
              e.stopPropagation();
              handleSort("tvl");
            }}
          >
            <div>TVL</div>
            {sortConfig?.key !== "tvl" ? (
              <SortingIcon className="oui-text-base-contrast-20" size={8} />
            ) : sortConfig.direction === "asc" ? (
              <SortingAscIcon className="oui-text-base-contrast-80" size={8} />
            ) : (
              <SortingDescIcon className="oui-text-base-contrast-80" size={8} />
            )}
          </div>
        </div>
      ),
      sortable: false,
    },
    {
      key: "apy",
      title: "APY",
      sortable: true,
      className: "oui-flex oui-justify-end",
    },
  ];

  return (
    <SubMenuTabContent
      className={className}
      isOpen={isOpen}
      headers={headers}
      sortConfig={sortConfig}
      onSort={handleSort}
      data={data || []}
      renderRow={(item, index) => (
        <VaultRowItem item={item} index={index} key={index} />
      )}
      renderFooter={() => (
        <div
          className="oui-p-2 oui-flex oui-justify-center oui-items-center oui-cursor-pointer oui-text-xs oui-font-bold oui-text-primary-light hover:oui-opacity-80"
          onClick={() => navigate(generatePath({ path: PathEnum.Vaults }))}
        >
          {i18n.t("extend.viewAll")} <span className="oui-ml-1">→</span>
        </div>
      )}
    />
  );
};
