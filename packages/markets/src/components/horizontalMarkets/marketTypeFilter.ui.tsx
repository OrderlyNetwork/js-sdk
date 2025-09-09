import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, cn, Checkbox, Divider } from "@orderly.network/ui";
import { FilterIcon } from "../../icons";
import type { MarketType } from "./horizontalMarkets.script";

export type MarketTypeFilterProps = {
  selectedMarketType: MarketType;
  onMarketTypeChange: (marketType: MarketType) => void;
  className?: string;
  position?: "top" | "bottom";
};

const marketTypeBase: Array<{
  value: MarketType;
  label: string;
  translationKey: string;
}> = [
  { value: "recent", label: "Recent", translationKey: "Recent" },
  { value: "all", label: "All Markets", translationKey: "All" },
  { value: "newListing", label: "New Listing", translationKey: "New listing" },
];

const marketTypeFavorites: Array<{
  value: MarketType;
  label: string;
  translationKey: string;
}> = [
  { value: "favorites", label: "Favorites", translationKey: "Favorites" },
  { value: "trending", label: "Trending", translationKey: "Trending" },
];

export const MarketTypeFilter: React.FC<MarketTypeFilterProps> = (props) => {
  const {
    selectedMarketType,
    onMarketTypeChange,
    className,
    position = "bottom",
  } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Open dropdown
  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  // Handle option click
  const handleOptionClick = (marketType: MarketType) => {
    onMarketTypeChange(marketType);
    setIsOpen(false);
  };

  return (
    <Box
      ref={dropdownRef}
      className={cn("oui-relative oui-inline-block", className)}
    >
      {/* Filter Button */}
      <Flex
        className={cn("oui-cursor-pointer oui-rounded")}
        itemAlign="center"
        onClick={handleFilterClick}
      >
        <FilterIcon
          className={cn(
            "oui-size-[18px] oui-text-base-contrast-36 hover:oui-text-base-contrast-80 oui-transition-colors",
          )}
        />
      </Flex>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="oui-text-base-contrast-54">
          <Box
            className={cn(
              "oui-absolute oui-left-0 oui-z-50",
              "oui-bg-base-9 oui-border oui-border-line-6 oui-rounded-[12px]",
              "oui-shadow-lg oui-w-[320px] oui-p-5",
              position === "top"
                ? "oui-bottom-full oui-mb-1"
                : "oui-top-full oui-mt-1",
            )}
          >
            <Flex direction="column" gapY={3} itemAlign="start">
              {/* Base Market Types */}
              <Flex
                direction="row"
                gapX={3}
                wrap="wrap"
                gapY={1}
                className="oui-gap-x-2 md:oui-gap-x-3"
              >
                {marketTypeBase.map((option) => (
                  <Flex
                    key={option.value}
                    className={cn("oui-cursor-pointer")}
                    itemAlign="center"
                    onClick={() => handleOptionClick(option.value)}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      data-testid={`oui-testid-marketType-${option.value}-checkBox`}
                      id={`toggle_market_type_${option.value}`}
                      className="oui-peer"
                      color="white"
                      checked={selectedMarketType === option.value}
                      onCheckedChange={() => handleOptionClick(option.value)}
                    />

                    <label
                      htmlFor={`toggle_market_type_${option.value}`}
                      className={cn(
                        "oui-text-2xs oui-ml-1",
                        "oui-break-normal oui-whitespace-nowrap oui-cursor-pointer",
                      )}
                    >
                      {option.translationKey}
                    </label>
                  </Flex>
                ))}
              </Flex>

              {/* Divider */}
              <Divider
                className="oui-w-full"
                direction="horizontal"
                intensity={16}
              />

              {/* Favorites Title */}
              <Text className="oui-text-xs oui-text-base-contrast-54 oui-font-medium">
                Favorites
              </Text>

              {/* Favorites Market Types */}
              <Flex
                direction="row"
                gapX={3}
                wrap="wrap"
                gapY={1}
                className="oui-gap-x-2 md:oui-gap-x-3"
              >
                {marketTypeFavorites.map((option) => (
                  <Flex
                    key={option.value}
                    className={cn("oui-cursor-pointer")}
                    itemAlign="center"
                    onClick={() => handleOptionClick(option.value)}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      data-testid={`oui-testid-marketType-${option.value}-checkBox`}
                      id={`toggle_market_type_${option.value}`}
                      className="oui-peer"
                      color="white"
                      checked={selectedMarketType === option.value}
                      onCheckedChange={() => handleOptionClick(option.value)}
                    />

                    <label
                      htmlFor={`toggle_market_type_${option.value}`}
                      className={cn(
                        "oui-text-2xs oui-ml-1",
                        "oui-break-normal oui-whitespace-nowrap oui-cursor-pointer",
                      )}
                    >
                      {option.translationKey}
                    </label>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Box>
        </div>
      )}
    </Box>
  );
};
