import React from "react";
import { SubMenuMarketsWidget } from "@orderly.network/markets-core";
import { cn } from "@orderly.network/ui";
import type { TradeSubMenuItem } from "./tradeSubMenu.items";
import type { TradeSubMenuScriptReturn } from "./tradeSubMenu.script";

const MARKETS_WRAPPER_CLASSNAME = [
  "oui-overflow-hidden",
  "oui-transition-[width,height] oui-duration-120 oui-ease-out",
  "data-[state=open]:oui-w-[280px] data-[state=closed]:oui-w-0",
  "data-[state=open]:oui-h-[423px] data-[state=closed]:oui-h-0",
  "data-[state=closed]:oui-pointer-events-none",
].join(" ");

const MARKETS_ANIMATION_CLASSNAME = [
  "oui-origin-top-left",
  "data-[state=open]:oui-animate-in data-[state=closed]:oui-animate-out",
  "data-[state=open]:oui-fade-in-0 data-[state=closed]:oui-fade-out-0",
  "data-[state=open]:oui-zoom-in-95 data-[state=closed]:oui-zoom-out-95",
  "data-[state=open]:oui-slide-in-from-top-2",
  "data-[state=open]:oui-slide-in-from-left-2",
].join(" ");

type TradeSubMenuRowProps = {
  item: TradeSubMenuItem;
  active: boolean;
  onClick: (item: TradeSubMenuItem) => void;
  onHover: (key: string) => void;
};

const TradeSubMenuRow: React.FC<TradeSubMenuRowProps> = (props) => {
  const { item, active, onClick, onHover } = props;
  return (
    <div
      className={cn(
        "oui-tradeSubMenu-item",
        "oui-flex oui-cursor-pointer oui-items-center oui-justify-between oui-rounded-md oui-p-3",
        active ? "oui-bg-base-5" : "hover:oui-bg-base-6",
      )}
      data-active={active}
      onClick={() => onClick(item)}
      onMouseEnter={() => onHover(item.key)}
    >
      <div className="oui-flex oui-items-center oui-gap-2">
        <div className="oui-size-5">
          {active ? item.activeIcon : item.inactiveIcon}
        </div>
        <div>
          <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
            {item.title}
          </div>
          {item.description && (
            <div className="oui-text-xs oui-text-base-contrast-36">
              {item.description}
            </div>
          )}
        </div>
      </div>
      <div className="oui-text-base-contrast-36">›</div>
    </div>
  );
};

export type TradeSubMenuProps = TradeSubMenuScriptReturn & {
  className?: string;
};

export const TradeSubMenu: React.FC<TradeSubMenuProps> = (props) => {
  const marketsState = props.marketsOpen ? "open" : "closed";
  return (
    <div
      className={cn(
        "oui-tradeSubMenu",
        "oui-flex oui-rounded-lg oui-border oui-border-line-6 oui-bg-base-8 oui-p-1",
        props.className,
      )}
      onMouseLeave={props.onMenuLeave}
    >
      <div className="oui-w-[240px] oui-shrink-0 oui-rounded-lg">
        {props.items.map((item) => (
          <TradeSubMenuRow
            key={item.key}
            item={item}
            active={props.activeKey === item.key}
            onClick={props.onItemClick}
            onHover={props.onItemHover}
          />
        ))}
      </div>
      {props.hasMarkets && (
        <div
          className={MARKETS_WRAPPER_CLASSNAME}
          onMouseEnter={props.onMarketsHover}
          data-state={marketsState}
        >
          <div
            className={MARKETS_ANIMATION_CLASSNAME}
            data-state={marketsState}
          >
            <div className="oui-ml-1 oui-h-[423px] oui-w-[280px]">
              <SubMenuMarketsWidget
                className="oui-rounded-md oui-p-2"
                symbol={props.perpsSymbol}
                onSymbolChange={props.onSymbolChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
