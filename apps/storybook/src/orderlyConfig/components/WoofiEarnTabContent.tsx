import React, { useState } from "react";
import { i18n } from "@orderly.network/i18n";
import { useWoofiEarnInfo, WoofiEarnUserData } from "../hooks/useWoofiEarnInfo";
import { HeaderItem, SubMenuTabContent } from "./SubMenuTabContent";

const formatNetworkName = (network: string) => {
  const lower = network.toLowerCase();
  if (lower === "bsc") return "BSC";
  if (lower === "avax") return "Avalanche";
  return network.charAt(0).toUpperCase() + network.slice(1);
};

const WoofiEarnRowItem = (props: {
  item: WoofiEarnUserData;
  index: number;
}) => {
  const { item, index } = props;

  const handleClick = () => {
    window.location.href = `https://woofi.com/swap/earn?network=${item.network}&vault_address=${item.vault}`;
  };

  return (
    <div
      className="oui-flex oui-items-center oui-justify-between oui-px-1 oui-py-1.5 oui-cursor-pointer hover:oui-bg-base-7 oui-rounded-sm"
      onClick={handleClick}
    >
      <div className="oui-flex oui-items-center oui-gap-2.5">
        <div className="oui-relative oui-w-6 oui-h-6">
          <img
            src={item.token_logo}
            alt={item.symbol}
            className="oui-w-6 oui-h-6 oui-absolute oui-bottom-0 oui-right-0 oui-rounded-full"
          />
          <img
            src={item.network_logo}
            alt={item.network}
            className="oui-w-3 oui-h-3 oui-absolute oui-top-[15px] oui-left-[15px] oui-rounded-full oui-border oui-border-base-9"
          />
        </div>
        <div className="oui-flex oui-flex-col">
          <div className="oui-text-xs oui-font-semibold oui-text-base-contrast-80">
            {item.symbol}
          </div>
          <div className="oui-text-xs oui-text-base-contrast-54 oui-font-normal oui-leading-[18px]">
            {formatNetworkName(item.network)}
          </div>
        </div>
      </div>
      <div className="oui-text-2xs oui-font-semibold oui-text-trade-profit">
        {item.apr.toFixed(2)}%
      </div>
    </div>
  );
};

export const WoofiEarnTabContent = (props: {
  className?: string;
  isOpen: boolean;
}) => {
  const { className, isOpen } = props;
  const [sortConfig, setSortConfig] = useState<{
    key: "apr";
    direction: "asc" | "desc";
  } | null>(null);

  const { data } = useWoofiEarnInfo(sortConfig);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key !== key) {
        return { key: key as "apr", direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { key: key as "apr", direction: "asc" };
      }
      return null;
    });
  };

  const headers: HeaderItem[] = [
    {
      key: "name",
      title: "Name",
      sortable: false,
    },
    {
      key: "apr",
      title: "APR",
      sortable: true,
      className:
        "oui-flex oui-justify-end oui-cursor-pointer hover:oui-text-base-contrast-54",
    },
  ];

  return (
    <SubMenuTabContent
      className={className}
      isOpen={isOpen}
      headers={headers}
      data={data || []}
      sortConfig={sortConfig}
      onSort={handleSort}
      renderRow={(item, index) => (
        <WoofiEarnRowItem item={item} index={index} key={index} />
      )}
      renderFooter={() => (
        <div
          className="oui-p-2 oui-flex oui-justify-center oui-items-center oui-cursor-pointer oui-text-xs oui-font-bold oui-text-primary-light hover:oui-opacity-80"
          onClick={() => {
            window.location.href = "https://woofi.com/swap/earn";
          }}
        >
          {i18n.t("extend.viewAll")} <span className="oui-ml-1">→</span>
        </div>
      )}
    />
  );
};
