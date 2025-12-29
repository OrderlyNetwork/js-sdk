import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { generatePath, useTranslation } from "@orderly.network/i18n";
import { SubMenuMarketsWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import {
  EarnActiveIcon,
  EarnInactiveIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
} from "@orderly.network/ui";
import { PathEnum } from "../../playground/constant";
import { DEFAULT_SYMBOL, updateSymbol } from "../../playground/storage";
import { MenuItemRow } from "./SubMenuComponents";

const RIGHT_SECTION_WRAPPER_CLASSNAME = [
  "oui-overflow-hidden",
  "oui-transition-[width,height] oui-duration-120 oui-ease-out",
  "data-[state=open]:oui-w-[280px] data-[state=closed]:oui-w-0",
  "data-[state=open]:oui-h-[423px] data-[state=closed]:oui-h-0",
  "data-[state=closed]:oui-pointer-events-none",
].join(" ");

const RIGHT_SECTION_ANIMATION_CLASSNAME = [
  "oui-origin-top-left",
  "data-[state=open]:oui-animate-in data-[state=closed]:oui-animate-out",
  "data-[state=open]:oui-fade-in-0 data-[state=closed]:oui-fade-out-0",
  "data-[state=open]:oui-zoom-in-95 data-[state=closed]:oui-zoom-out-95",
  "data-[state=open]:oui-slide-in-from-top-2",
  "data-[state=open]:oui-slide-in-from-left-2",
].join(" ");

const LeftSection = (props: {
  selectedTab: string;
  onSelect: (tab: string) => void;
  onSpotClick: () => void;
  onPerpsClick: () => void;
  onHoverTab: (tab: "perps" | null) => void;
}) => {
  const { selectedTab, onSelect, onSpotClick, onPerpsClick, onHoverTab } =
    props;
  const { t } = useTranslation();

  return (
    <div className="oui-w-[240px] oui-flex-shrink-0 oui-rounded-lg">
      <MenuItemRow
        key="spot"
        activeIcon={
          selectedTab === "spot" ? (
            <EarnActiveIcon size={20} />
          ) : (
            <EarnInactiveIcon size={20} />
          )
        }
        title={t("extend.spot")}
        description={t("extend.spot.description")}
        onClick={() => {
          onSelect("spot");
          onSpotClick();
        }}
        onMouseEnter={() => {
          onHoverTab(null);
        }}
        isActive={selectedTab === "spot"}
        showArrow={true}
      />

      <MenuItemRow
        key="perps"
        className="oui-mt-1"
        activeIcon={
          selectedTab === "perps" ? (
            <TradingActiveIcon size={20} />
          ) : (
            <TradingInactiveIcon size={20} />
          )
        }
        title={t("extend.perps")}
        description={t("extend.perps.description")}
        onClick={() => {
          onSelect("perps");
          onPerpsClick();
        }}
        onMouseEnter={() => {
          onHoverTab("perps");
        }}
        isActive={selectedTab === "perps"}
        showArrow={true}
      />
    </div>
  );
};

const RightSection = (props: { className?: string }) => {
  const { className } = props;
  const params = useParams();
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<string>(params.symbol || DEFAULT_SYMBOL);

  useEffect(() => {
    const next = params.symbol || DEFAULT_SYMBOL;
    if (next !== symbol) setSymbol(next);
  }, [params.symbol]);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const nextSymbol = data.symbol;
      setSymbol(nextSymbol);
      navigate(generatePath({ path: `${PathEnum.Perp}/${nextSymbol}` }));
    },
    [navigate],
  );

  return (
    <div className={className}>
      <SubMenuMarketsWidget
        className="oui-rounded-md oui-p-2"
        symbol={symbol}
        onSymbolChange={onSymbolChange}
      />
    </div>
  );
};

export const customTradeSubMenuRender = () => {
  return () => {
    const [selectedTab, setSelectedTab] = useState("perps");
    const [hoverTab, setHoverTab] = useState<"perps" | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSpotClick = () => {
      navigate(generatePath({ path: PathEnum.Swap }));
    };

    const handlePerpsClick = () => {
      navigate(generatePath({ path: PathEnum.Perp }));
    };

    useEffect(() => {
      const pathname = location.pathname || "";
      if (pathname.includes(PathEnum.Swap)) setSelectedTab("spot");
    }, [location.pathname]);

    const showPerpsRightSection =
      selectedTab === "perps" || hoverTab === "perps";
    const rightSectionState = showPerpsRightSection ? "open" : "closed";

    return (
      <div
        className="oui-flex oui-p-1 oui-bg-base-8 oui-rounded-lg oui-border oui-border-line-6"
        onMouseLeave={() => {
          setHoverTab(null);
        }}
      >
        <LeftSection
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
          onSpotClick={handleSpotClick}
          onPerpsClick={handlePerpsClick}
          onHoverTab={setHoverTab}
        />
        <div
          className={RIGHT_SECTION_WRAPPER_CLASSNAME}
          onMouseEnter={() => {
            setHoverTab("perps");
          }}
          data-state={rightSectionState}
        >
          <div
            className={RIGHT_SECTION_ANIMATION_CLASSNAME}
            data-state={rightSectionState}
          >
            <RightSection className="oui-w-[280px] oui-h-[423px] oui-ml-1" />
          </div>
        </div>
      </div>
    );
  };
};
