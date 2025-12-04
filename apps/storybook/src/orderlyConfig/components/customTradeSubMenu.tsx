import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generatePath, useTranslation } from "@veltodefi/i18n";
import { SubMenuMarketsWidget } from "@veltodefi/markets";
import { API } from "@veltodefi/types";
import {
  EarnActiveIcon,
  EarnInactiveIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
} from "@veltodefi/ui";
import { PathEnum } from "../../playground/constant";
import { DEFAULT_SYMBOL, updateSymbol } from "../../playground/storage";

type IconProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

const LeftSection = (props: {
  selectedTab: string;
  onSelect: (tab: string) => void;
  onSpotClick: () => void;
}) => {
  const { selectedTab, onSelect, onSpotClick } = props;
  const { t } = useTranslation();

  return (
    <div className="oui-w-[240px] oui-h-[423px] oui-flex-shrink-0 oui-rounded-lg">
      {/* Spot Row */}
      <div
        className="oui-flex oui-items-center oui-justify-between oui-p-3 oui-rounded-md oui-cursor-pointer hover:oui-bg-base-5"
        onClick={onSpotClick}
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
        onClick={() => onSelect("perps")}
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

    const handleSpotClick = () => {
      window.location.href = "https://woofi.com/swap";
    };

    return (
      <div className="oui-flex oui-p-1 oui-gap-1 oui-bg-base-8 oui-rounded-lg oui-border oui-border-line-6">
        <LeftSection
          selectedTab={selectedTab}
          onSelect={setSelectedTab}
          onSpotClick={handleSpotClick}
        />
        <RightSection className="oui-w-[280px] oui-h-[423px]" />
      </div>
    );
  };
};
