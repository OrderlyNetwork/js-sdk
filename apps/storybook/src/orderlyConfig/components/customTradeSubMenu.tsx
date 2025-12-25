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
      {/* Spot Row */}
      <div
        className={`oui-flex oui-items-center oui-justify-between oui-p-3 oui-rounded-md oui-cursor-pointer ${
          selectedTab === "spot" ? "oui-bg-base-5" : "hover:oui-bg-base-6"
        }`}
        onMouseEnter={() => {
          onHoverTab(null);
        }}
        onClick={() => {
          onSelect("spot");
          onSpotClick();
        }}
      >
        <div className="oui-flex oui-items-center oui-gap-2">
          <div className="oui-w-5 oui-h-5">
            {selectedTab === "spot" ? (
              <EarnActiveIcon size={20} />
            ) : (
              <EarnInactiveIcon size={20} />
            )}
          </div>
          <div>
            <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
              {t("extend.spot")}
            </div>
            <div className="oui-text-xs oui-text-base-contrast-36">
              {t("extend.spot.description")}
            </div>
          </div>
        </div>
        <div className="oui-text-base-contrast-36">›</div>
      </div>

      {/* Perps Row - Selected by default */}
      <div
        className={`oui-flex oui-items-center oui-justify-between oui-p-3 oui-mt-1 oui-rounded-md oui-cursor-pointer ${
          selectedTab === "perps" ? "oui-bg-base-5" : "hover:oui-bg-base-6"
        }`}
        onMouseEnter={() => {
          onHoverTab("perps");
        }}
        onClick={() => {
          onSelect("perps");
          onPerpsClick();
        }}
      >
        <div className="oui-flex oui-items-center oui-gap-2">
          <div className="oui-w-5 oui-h-5">
            {selectedTab === "perps" ? (
              <TradingActiveIcon size={20} />
            ) : (
              <TradingInactiveIcon size={20} />
            )}
          </div>
          <div>
            <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
              {t("extend.perps")}
            </div>
            <div className="oui-text-xs oui-text-base-contrast-36">
              {t("extend.perps.description")}
            </div>
          </div>
        </div>
        <div className="oui-text-base-contrast-36">›</div>
      </div>
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
