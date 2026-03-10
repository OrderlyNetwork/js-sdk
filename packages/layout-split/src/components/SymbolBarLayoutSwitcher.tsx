import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseIcon,
  cn,
  Divider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
} from "@orderly.network/ui";
import { useSplitPresetContext } from "../SplitPresetContext";
import {
  MarketLeftIcon,
  MarketTopIcon,
  MarketBottomIcon,
  MarketHideIcon,
} from "./icons";
import { LayoutIcon } from "./icons/LayoutIcon";
import { OrderEntryIcon } from "./icons/OrderEntryIcon";

type LayoutPosition = "left" | "right";

// Local copy of market layout positions so this component has no dependency on the trading package.
type MarketLayoutPosition = "left" | "top" | "bottom" | "hide";

/**
 * Maps preset ids defined in DEFAULT_SPLIT_PRESETS to a (layout, markets) pair.
 * This keeps the UI state in sync with the underlying split layout presets.
 */
const PRESET_ID_TO_STATE: Record<
  string,
  { layout: LayoutPosition; markets: MarketLayoutPosition }
> = {
  "advanced-right_markets-left": { layout: "right", markets: "left" },
  "advanced-right_markets-top": { layout: "right", markets: "top" },
  "advanced-right_markets-bottom": { layout: "right", markets: "bottom" },
  "advanced-right_markets-hide": { layout: "right", markets: "hide" },
  "advanced-left_markets-left": { layout: "left", markets: "left" },
  "advanced-left_markets-top": { layout: "left", markets: "top" },
  "advanced-left_markets-bottom": { layout: "left", markets: "bottom" },
  "advanced-left_markets-hide": { layout: "left", markets: "hide" },
};

/**
 * Inverse map from (layout, markets) pair back to preset id.
 * Key format: `${layout}_${markets}`.
 */
const STATE_TO_PRESET_ID: Record<string, string> = Object.entries(
  PRESET_ID_TO_STATE,
).reduce<Record<string, string>>((acc, [id, state]) => {
  acc[`${state.layout}_${state.markets}`] = id;
  return acc;
}, {});

interface LayoutSwitchButtonProps {
  layout: LayoutPosition;
  markets: MarketLayoutPosition;
  onChange: (next: {
    layout: LayoutPosition;
    markets: MarketLayoutPosition;
  }) => void;
}

/**
 * Dropdown UI for switching between advanced left/right and markets left/top/bottom/hide.
 * This component is purely presentational; it delegates state changes via the onChange callback.
 */
const LayoutSwitchButton: React.FC<LayoutSwitchButtonProps> = ({
  layout,
  markets,
  onChange,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [hoveredMarket, setHoveredMarket] =
    React.useState<MarketLayoutPosition | null>(null);

  const renderLayoutItem = (position: LayoutPosition) => (
    <Flex
      direction="column"
      gapY={2}
      onClick={() => {
        onChange({ layout: position, markets });
        setOpen(false);
      }}
      className="oui-group"
    >
      <Flex
        justify={position === "right" ? "end" : "start"}
        className={cn(
          "oui-w-[148px] oui-h-[100px]",
          "oui-bg-base-10 oui-rounded-[10px]",
          "oui-border-[4px] oui-border-base-5 group-hover:oui-border-primary-light",
          layout === position && "!oui-border-primary-light",
        )}
      >
        <Box p={1}>
          <OrderEntryIcon />
        </Box>
      </Flex>
      <Text
        size="2xs"
        intensity={54}
        className={cn(
          "oui-text-base-contrast-54 group-hover:oui-text-base-contrast-80",
          layout === position && "oui-text-base-contrast-80",
        )}
      >
        {String(
          position === "right"
            ? t("trading.layout.advanced.right")
            : t("trading.layout.advanced.left"),
        )}
      </Text>
    </Flex>
  );

  const renderMarketItem = (position: MarketLayoutPosition) => {
    const isSelected = markets === position;
    const isHovered = hoveredMarket === position;

    const getLabel = () => {
      switch (position) {
        case "left":
          return t("trading.layout.markets.left");
        case "top":
          return t("trading.layout.markets.top");
        case "bottom":
          return t("trading.layout.markets.bottom");
        case "hide":
          return t("trading.layout.markets.hide");
        default:
          return t("trading.layout.markets.left");
      }
    };

    return (
      <Flex
        direction="column"
        gapY={2}
        onClick={() => {
          onChange({ layout, markets: position });
          setOpen(false);
        }}
        onMouseEnter={() => setHoveredMarket(position)}
        onMouseLeave={() => setHoveredMarket(null)}
        className="oui-group"
      >
        <Flex justify="center" className="oui-w-[148px] oui-h-[100px]">
          {position === "left" && (
            <MarketLeftIcon isSelected={isSelected} isHovered={isHovered} />
          )}
          {position === "top" && (
            <MarketTopIcon isSelected={isSelected} isHovered={isHovered} />
          )}
          {position === "bottom" && (
            <MarketBottomIcon isSelected={isSelected} isHovered={isHovered} />
          )}
          {position === "hide" && (
            <MarketHideIcon isSelected={isSelected} isHovered={isHovered} />
          )}
        </Flex>
        <Text
          size="2xs"
          intensity={54}
          className={cn(
            "oui-text-base-contrast-54 group-hover:oui-text-base-contrast-80",
            isSelected && "oui-text-base-contrast-80",
          )}
        >
          {String(getLabel())}
        </Text>
      </Flex>
    );
  };

  const content = (
    <>
      <Flex
        itemAlign="center"
        justify="between"
        mt={3}
        className="oui-mb-[10px] oui-min-w-[500px]"
      >
        <Text size="base" intensity={98}>
          {t("trading.layout")}
        </Text>
        <CloseIcon
          size={16}
          className="oui-cursor-pointer oui-text-base-contrast-80"
          opacity={0.98}
          onClick={() => {
            setOpen(false);
          }}
        />
      </Flex>
      <Divider />
      <Flex direction="column" gapY={2} mt={5} itemAlign="start">
        <Text size="xs" intensity={98}>
          {String(t("trading.layout.advanced"))}
        </Text>
        <Flex gapX={6}>
          {renderLayoutItem("left")}
          {renderLayoutItem("right")}
        </Flex>
      </Flex>
      <Flex direction="column" gapY={2} mt={5} itemAlign="start">
        <Text size="xs" intensity={98}>
          {String(t("trading.layout.markets"))}
        </Text>
        <Flex gapX={6}>
          {renderMarketItem("left")}
          {renderMarketItem("top")}
          {renderMarketItem("bottom")}
          {renderMarketItem("hide")}
        </Flex>
      </Flex>
    </>
  );

  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Flex
          px={3}
          className={cn(
            "oui-rounded-md",
            "oui-h-[28px]",
            "oui-cursor-pointer oui-transition-all",
            "oui-bg-base-6 hover:oui-bg-base-4",
            "oui-text-base-contrast-54 hover:oui-text-base-contrast-80",
          )}
          gapX={1}
          ml={3}
          justify="center"
          itemAlign="center"
        >
          <Text size="2xs" weight="semibold">
            {t("trading.layout")}
          </Text>
        </Flex>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="end"
          className={cn("oui-bg-base-8 oui-p-5 oui-pt-0 oui-font-semibold")}
        >
          {content}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

/**
 * Symbol bar trailing control that bridges the layout switch UI and split layout presets.
 * Reads the selected preset from context and updates it when the user chooses a new combination.
 */
export const SymbolBarLayoutSwitcher: React.FC = () => {
  const ctx = useSplitPresetContext();

  if (!ctx) return null;

  const currentState =
    PRESET_ID_TO_STATE[ctx.selectedPresetId] ??
    PRESET_ID_TO_STATE["advanced-right_markets-left"];

  const handleChange = (next: {
    layout: LayoutPosition;
    markets: MarketLayoutPosition;
  }) => {
    const key = `${next.layout}_${next.markets}`;
    const presetId = STATE_TO_PRESET_ID[key];
    if (presetId && presetId !== ctx.selectedPresetId) {
      ctx.setSelectedPresetId(presetId);
    }
  };

  return (
    <LayoutSwitchButton
      layout={currentState.layout}
      markets={currentState.markets}
      onChange={handleChange}
    />
  );
};
