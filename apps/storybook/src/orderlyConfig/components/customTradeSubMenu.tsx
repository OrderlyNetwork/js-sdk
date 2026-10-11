import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import { generatePath, useTranslation } from "@orderly.network/i18n";
import { SubMenuMarketsWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import {
  EarnActiveIcon,
  EarnInactiveIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  PredictionIcon,
} from "@orderly.network/ui";
import { useRouteContext } from "../../components/orderlyProvider/rounteProvider";
import { PathEnum } from "../../playground/constant";
import {
  DEFAULT_SYMBOL,
  getSymbol,
  updateSymbol,
} from "../../playground/storage";
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
  onPredictionClick: () => void;
  onRWAClick: () => void;
  onHoverTab: (tab: "perps" | null) => void;
}) => {
  const {
    selectedTab,
    onSelect,
    onSpotClick,
    onPerpsClick,
    onPredictionClick,
    onRWAClick,
    onHoverTab,
  } = props;
  const { t } = useTranslation();

  const menus = [
    {
      key: "spot",
      activeIcon: <EarnActiveIcon size={20} />,
      inactiveIcon: <EarnInactiveIcon size={20} />,
      title: t("extend.spot"),
      description: t("extend.spot.description"),
      onClick: () => {
        onSelect("spot");
        onSpotClick();
      },
    },
    {
      key: "perps",
      activeIcon: <TradingActiveIcon size={20} />,
      inactiveIcon: <TradingInactiveIcon size={20} />,
      title: t("extend.perps"),
      description: t("extend.perps.description"),
      onClick: () => {
        onSelect("perps");
        onPerpsClick();
      },
      onMouseEnter: () => {
        onHoverTab("perps");
      },
    },
    {
      key: "prediction",
      activeIcon: <PredictionIcon active size={20} />,
      inactiveIcon: <PredictionIcon size={20} />,
      title: t("prediction.title"),
      description: t("prediction.description"),
      onClick: () => {
        onSelect("prediction");
        onPredictionClick();
      },
    },
    {
      key: "rwa",
      activeIcon: <MarketsActiveIcon size={20} />,
      inactiveIcon: <MarketsInactiveIcon size={20} />,
      title: t("common.rwa"),
      description: t("common.rwa"),
      onClick: () => {
        onSelect("rwa");
        onRWAClick();
      },
    },
  ];

  return (
    <div className="oui-w-[240px] oui-flex-shrink-0 oui-rounded-lg">
      {menus.map((menu) => {
        const isActive = selectedTab === menu.key;
        return (
          <MenuItemRow
            key={menu.key}
            activeIcon={isActive ? menu.activeIcon : menu.inactiveIcon}
            title={menu.title}
            description={menu.description}
            onClick={menu.onClick}
            onMouseEnter={
              menu.onMouseEnter ??
              (() => {
                onHoverTab(null);
              })
            }
            isActive={isActive}
            showArrow={true}
          />
        );
      })}
    </div>
  );
};

/** Routes whose `:symbol` param is a perps market symbol. */
const PERPS_SYMBOL_ROUTE_PREFIXES = [
  PathEnum.Perp,
  PathEnum.Rwa,
  PathEnum.PerpGrid,
  PathEnum.PerpSplit,
];

const RightSection = (props: { className?: string }) => {
  const { className } = props;
  const params = useParams();
  const { pathname } = useLocation();

  const { onRouteChange } = useRouteContext();
  // `:symbol` also exists on /prediction (a round contract, not a perps
  // market); only perps-family routes may mirror their param into storage,
  // other routes fall back to the remembered symbol.
  const isPerpsSymbolRoute = PERPS_SYMBOL_ROUTE_PREFIXES.some((prefix) =>
    pathname.includes(`${prefix}/`),
  );
  const [symbol, setSymbol] = useState<string>(() =>
    isPerpsSymbolRoute ? params.symbol || DEFAULT_SYMBOL : getSymbol(),
  );

  useEffect(() => {
    if (!isPerpsSymbolRoute) return;
    const next = params.symbol || DEFAULT_SYMBOL;
    if (next !== symbol) setSymbol(next);
  }, [params.symbol, isPerpsSymbolRoute, symbol]);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const nextSymbol = data.symbol;
      setSymbol(nextSymbol);
      onRouteChange({
        href: `${PathEnum.Perp}/${nextSymbol}`,
        name: "perps",
      });
    },
    [onRouteChange],
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
    const { onRouteChange } = useRouteContext();
    const location = window.location;

    const handleSpotClick = () => {
      onRouteChange({
        href: PathEnum.Swap,
        name: "spot",
      });
    };

    const handlePerpsClick = () => {
      onRouteChange({ href: PathEnum.Perp, name: "perps" });
    };

    const handleRWAClick = () => {
      onRouteChange({ href: PathEnum.Rwa, name: "rwa" });
    };

    const handlePredictionClick = () => {
      onRouteChange({
        href: PathEnum.Prediction,
        name: "prediction",
      });
    };

    useEffect(() => {
      const pathname = location.pathname || "";
      if (pathname.includes(PathEnum.Prediction)) {
        setSelectedTab("prediction");
      } else if (pathname.includes(PathEnum.Swap)) {
        setSelectedTab("spot");
      } else if (pathname.includes(PathEnum.Rwa)) {
        setSelectedTab("rwa");
      } else {
        setSelectedTab("perps");
      }
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
          onPredictionClick={handlePredictionClick}
          onRWAClick={handleRWAClick}
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
