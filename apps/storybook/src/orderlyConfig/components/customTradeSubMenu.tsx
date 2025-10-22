import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generatePath, useTranslation } from "@orderly.network/i18n";
import { SubMenuMarketsWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import { PathEnum } from "../../playground/constant";
import { DEFAULT_SYMBOL, updateSymbol } from "../../playground/storage";

type IconProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

export const SpotIcon = ({ className, width = 20, height = 20 }: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M18.3293 13.3392C18.3293 13.1259 18.2576 12.9034 18.0951 12.74L14.996 9.66752L13.8243 10.8392L15.4643 12.5059H3.32932C2.86932 12.5059 2.49599 12.8792 2.49599 13.3392C2.49599 13.7992 2.86932 14.1725 3.32932 14.1725H15.4643L13.8243 15.8392L14.996 17.0109L18.0951 13.9384C18.2576 13.775 18.3293 13.5525 18.3293 13.3392ZM17.496 6.67253C17.496 6.21253 17.1226 5.83919 16.6626 5.83919H4.52682L6.16766 4.17253L4.99599 3.00085L1.89683 6.07336C1.57183 6.3992 1.57183 6.94585 1.89683 7.27169L4.99599 10.3442L6.16766 9.17253L4.52682 7.50586H16.6626C17.1226 7.50586 17.496 7.13253 17.496 6.67253Z"
      fill="white"
      fillOpacity="0.54"
    />
  </svg>
);

export const PerpsIcon = ({
  className,
  width = 20,
  height = 20,
}: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14.3213 2.44141C16.0928 2.44149 17.4989 3.94461 17.499 5.77441V14.1084C17.4989 15.9382 16.0928 17.4413 14.3213 17.4414H5.67578C3.90506 17.4414 2.49919 15.9382 2.49902 14.1084V5.77441C2.49919 3.94456 3.90505 2.44141 5.67578 2.44141H14.3213ZM4.16504 7.44141V14.1084C4.1652 15.0399 4.84838 15.7744 5.67578 15.7744H5.83203V7.44141H4.16504ZM7.49902 7.44141V15.7744H14.3213C15.1495 15.7743 15.8319 15.0398 15.832 14.1084V7.44141H7.49902ZM10.2441 9.41113C10.5696 9.0857 11.0974 9.0857 11.4229 9.41113L13.0889 11.0771C13.4143 11.4026 13.4143 11.9304 13.0889 12.2559L11.4229 13.9229C11.0975 14.2482 10.5696 14.2481 10.2441 13.9229C9.91871 13.5974 9.91873 13.0696 10.2441 12.7441L11.3213 11.667L10.2441 10.5889C9.91889 10.2635 9.91894 9.73654 10.2441 9.41113ZM5.67578 4.1084C4.84838 4.1084 4.1652 4.8429 4.16504 5.77441H15.832C15.8319 4.84296 15.1495 4.10849 14.3213 4.1084H5.67578Z"
      fill="url(#paint0_linear_560_11115)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_560_11115"
        x1="17.499"
        y1="9.9414"
        x2="2.49902"
        y2="9.9414"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#59B0FE" />
        <stop offset="1" stopColor="#26FEFE" />
      </linearGradient>
    </defs>
  </svg>
);

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
            <SpotIcon />
          </div>
          <div>
            <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-98">
              {t("common.spot")}
            </div>
            <div className="oui-text-xs oui-text-base-contrast-54">
              {t("markets.spot.description")}
            </div>
          </div>
        </div>
        <div className="oui-text-base-contrast-36">›</div>
      </div>

      {/* Perps Row - Selected by default */}
      <div
        className={`oui-flex oui-items-center oui-justify-between oui-p-3 oui-mt-1 oui-rounded-md oui-cursor-pointer ${
          selectedTab === "perps" ? "oui-bg-base-5" : "hover:oui-bg-base-5"
        }`}
        onClick={() => onSelect("perps")}
      >
        <div className="oui-flex oui-items-center oui-gap-2">
          <div className="oui-w-5 oui-h-5">
            <PerpsIcon />
          </div>
          <div>
            <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-98">
              {t("common.perps")}
            </div>
            <div className="oui-text-xs oui-text-base-contrast-54">
              {t("markets.perps.description")}
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
