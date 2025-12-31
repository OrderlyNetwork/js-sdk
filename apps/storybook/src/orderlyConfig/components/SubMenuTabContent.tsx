import React from "react";
import {
  SortingIcon,
  SortingAscIcon,
  SortingDescIcon,
} from "@orderly.network/ui";

export interface HeaderItem {
  key: string;
  title: React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface SubMenuTabContentProps<T> {
  className?: string;
  isOpen: boolean;
  headers: HeaderItem[];
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  data: T[];
  loading?: boolean;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

export const SubMenuTabContent = <T,>(props: SubMenuTabContentProps<T>) => {
  const {
    className,
    headers,
    sortConfig,
    onSort,
    data,
    renderRow,
    renderFooter,
  } = props;

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <SortingIcon className="oui-text-base-contrast-20" size={8} />;
    }
    if (sortConfig.direction === "asc") {
      return <SortingAscIcon className="oui-text-base-contrast-80" size={8} />;
    }
    return <SortingDescIcon className="oui-text-base-contrast-80" size={8} />;
  };

  return (
    <div className={`oui-flex oui-flex-col oui-h-full ${className}`}>
      {/* Header */}
      <div className="oui-flex oui-items-center oui-justify-between oui-mb-1 oui-p-1">
        {headers.map((header) => (
          <div
            key={header.key}
            className={`oui-text-2xs oui-text-base-contrast-36 ${header.className || ""}`}
          >
            {header.sortable ? (
              <div
                className="oui-flex oui-items-center oui-gap-1 oui-cursor-pointer hover:oui-text-base-contrast-54"
                onClick={() => onSort?.(header.key)}
              >
                <div>{header.title}</div>
                {renderSortIcon(header.key)}
              </div>
            ) : (
              header.title
            )}
          </div>
        ))}
      </div>

      {/* List */}
      <div className="oui-flex-1 oui-overflow-y-auto">
        {data?.map((item, index) => renderRow(item, index))}
      </div>

      {/* Footer */}
      {renderFooter?.()}
    </div>
  );
};
