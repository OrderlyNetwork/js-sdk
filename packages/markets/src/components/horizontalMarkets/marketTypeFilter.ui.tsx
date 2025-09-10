import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMarkets, MarketsType } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, cn, Checkbox, Divider } from "@orderly.network/ui";
import { FilterIcon } from "../../icons";
import type { MarketType } from "./horizontalMarkets.script";

export type DropdownPos = "top" | "bottom";

export type MarketTypeFilterProps = {
  selectedMarketType: MarketType;
  onMarketTypeChange: (marketType: MarketType) => void;
  className?: string;
  position?: DropdownPos;
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
}> = [{ value: "favorites", label: "Favorites", translationKey: "Favorites" }];

export const MarketTypeFilter: React.FC<MarketTypeFilterProps> = (props) => {
  const {
    selectedMarketType,
    onMarketTypeChange,
    className,
    position = "bottom" as DropdownPos,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Access shared favorites store for tabs rendering
  const [, favorite] = useMarkets(MarketsType.FAVORITES);
  const hasFavorites = (favorite?.favorites?.length || 0) > 0;

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
  const handleFilterClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Handle option click
  const handleOptionClick = useCallback(
    (marketType: MarketType) => {
      onMarketTypeChange(marketType);
      setIsOpen(false);
    },
    [onMarketTypeChange],
  );

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
              // animation
              "oui-animate-in oui-fade-in-0 oui-zoom-in-95",
              position === "top"
                ? "oui-bottom-full oui-mb-1 oui-slide-in-from-bottom-2"
                : "oui-top-full oui-mt-1 oui-slide-in-from-top-2",
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

              {hasFavorites && (
                <>
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

                  {/* Favorites Tabs as checkbox list */}
                  <Flex
                    direction="row"
                    gapX={3}
                    wrap="wrap"
                    gapY={1}
                    className="oui-gap-x-2 md:oui-gap-x-3"
                  >
                    {favorite.favoriteTabs?.slice(0, 10)?.map((tab) => {
                      const isActiveTab =
                        selectedMarketType === "favorites" &&
                        favorite.selectedFavoriteTab?.id === tab.id;
                      const htmlId = `toggle_market_type_favorites_${tab.id}`;
                      return (
                        <Flex
                          key={tab.id}
                          className={cn("oui-cursor-pointer")}
                          itemAlign="center"
                          onClick={() => {
                            favorite.updateSelectedFavoriteTab(tab);
                            onMarketTypeChange("favorites");
                            setIsOpen(false);
                          }}
                        >
                          <Checkbox
                            data-testid={`oui-testid-marketType-favorites-${tab.id}-checkBox`}
                            id={htmlId}
                            className="oui-peer"
                            color="white"
                            checked={isActiveTab}
                          />

                          <label
                            htmlFor={htmlId}
                            className={cn(
                              "oui-text-2xs oui-ml-1",
                              "oui-break-normal oui-whitespace-nowrap oui-cursor-pointer",
                            )}
                          >
                            {tab.name}
                          </label>
                        </Flex>
                      );
                    })}
                  </Flex>
                </>
              )}
            </Flex>
          </Box>
        </div>
      )}
    </Box>
  );
};
