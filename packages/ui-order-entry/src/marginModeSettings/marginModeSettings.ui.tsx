import React, { FC, useCallback } from "react";
import {
  Button,
  Checkbox,
  CloseCircleFillIcon,
  CloseIcon,
  Divider,
  Input,
  Text,
  cn,
} from "@orderly.network/ui";
import type {
  MarginMode,
  MarginModeSettingsItem,
  MarginModeSettingsState,
} from "./marginModeSettings.script";

export type MarginModeSettingsProps = Pick<
  MarginModeSettingsState,
  | "isMobile"
  | "close"
  | "filteredItems"
  | "searchKeyword"
  | "selectedKeys"
  | "itemMarginModes"
  | "isSelectAll"
  | "isIndeterminate"
  | "isLoading"
  | "onSearchChange"
  | "onToggleItem"
  | "onToggleSelectAll"
> & {
  onSetMarginMode: (mode: MarginMode) => Promise<void> | void;
};

export const MarginModeSettings: FC<MarginModeSettingsProps> = (props) => {
  const headerPadding = props.isMobile
    ? "oui-px-4 oui-pt-3"
    : "oui-px-5 oui-pt-3";
  const contentPadding = props.isMobile ? "oui-px-4" : "oui-px-5";

  const selectedCount = props.selectedKeys.size;
  const totalCountTextClassName =
    selectedCount > 0 ? "oui-text-primary-light" : "oui-text-base-contrast-36";

  const handleClearSearch = useCallback(() => {
    props.onSearchChange("");
  }, [props]);

  const handleSetCross = useCallback(() => {
    void props.onSetMarginMode("cross");
  }, [props]);

  const handleSetIsolated = useCallback(() => {
    void props.onSetMarginMode("isolated");
  }, [props]);

  return (
    <div
      className={cn(
        "oui-flex oui-h-full oui-w-full oui-flex-col",
        "oui-rounded-[12px] oui-bg-base-8",
        // Keep the dialog height stable on desktop; only the symbol list scrolls.
        !props.isMobile && "oui-overflow-hidden",
      )}
      data-testid="oui-testid-marginModeSettings"
    >
      <div className={cn("oui-w-full", headerPadding)}>
        <div className="oui-flex oui-items-center oui-justify-between">
          {props.isMobile ? (
            <button
              type="button"
              className="oui-size-[18px] oui-opacity-0"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}

          <Text
            className={cn(
              "oui-font-semibold oui-tracking-[0.48px]",
              props.isMobile
                ? "oui-text-center oui-text-lg oui-leading-[26px]"
                : "oui-text-base oui-leading-6",
            )}
            intensity={98}
          >
            {"Perpetual futures"}
          </Text>

          <button
            type="button"
            className="oui-flex oui-size-[18px] oui-items-center oui-justify-center"
            onClick={props.close}
            aria-label="Close"
            data-testid="oui-testid-marginModeSettings-close"
          >
            <CloseIcon size={18} color="white" opacity={0.98} />
          </button>
        </div>
        <Divider className="oui-mt-[9px] oui-w-full" />
      </div>

      <div
        className={cn(
          "oui-relative oui-z-10 oui-w-full oui-bg-base-8",
          contentPadding,
          "oui-py-3",
        )}
      >
        <Input
          value={props.searchKeyword}
          onValueChange={props.onSearchChange}
          placeholder="Search"
          size="md"
          fullWidth
          classNames={{
            root: cn(
              "oui-outline-line-8",
              props.searchKeyword.trim() ? "oui-outline-primary-light" : "",
            ),
          }}
          prefix={
            <div className="oui-pl-3 oui-pr-1" aria-hidden="true">
              <SearchGlyph className="oui-text-base-contrast-54" />
            </div>
          }
          suffix={
            props.searchKeyword ? (
              <div className="oui-pr-2">
                <CloseCircleFillIcon
                  size={14}
                  className="oui-cursor-pointer oui-text-base-contrast-36"
                  onClick={handleClearSearch}
                />
              </div>
            ) : null
          }
          autoComplete="off"
        />
      </div>

      <div
        className={cn(
          "oui-flex oui-w-full oui-flex-col",
          props.isMobile ? "oui-flex-1 oui-min-h-0" : "",
        )}
      >
        <div
          className={cn(
            "oui-w-full oui-overflow-y-auto oui-custom-scrollbar",
            props.isMobile
              ? "oui-flex-1 oui-min-h-0 oui-max-h-[calc(100vh-200px)] oui-px-4 oui-pt-0 oui-pb-3"
              : "oui-max-h-[420px] oui-px-5 oui-pt-0 oui-pb-3",
            "oui-flex oui-flex-col oui-gap-3",
          )}
          style={
            {
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
            } as React.CSSProperties
          }
        >
          {props.filteredItems.map((item) => (
            <SymbolRow
              key={item.key}
              item={item}
              checked={props.selectedKeys.has(item.key)}
              marginMode={props.itemMarginModes[item.key] ?? "cross"}
              onToggle={props.onToggleItem}
            />
          ))}
        </div>

        <Divider className="oui-w-full" />

        <div
          className={cn(
            "oui-flex oui-w-full oui-items-center oui-justify-between",
            props.isMobile ? "oui-px-4 oui-py-3" : "oui-px-5 oui-py-3",
          )}
        >
          <div className="oui-flex oui-items-center oui-gap-2">
            <Checkbox
              color="white"
              // NOTE: our Checkbox component renders indeterminate visually similar to checked.
              // For now, only show checked state when it's truly select-all.
              checked={props.isSelectAll}
              onCheckedChange={() => {
                props.onToggleSelectAll();
              }}
              aria-label="Select all"
            />
            <Text className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
              {"Select all"}
            </Text>
          </div>

          <Text className="oui-text-sm oui-text-base-contrast-54">
            {"Total"}:{" "}
            <span className={cn("oui-font-semibold", totalCountTextClassName)}>
              {selectedCount}
            </span>
          </Text>
        </div>

        <div
          className={cn(
            "oui-flex oui-w-full oui-items-center oui-justify-end",
            props.isMobile
              ? "oui-px-4 oui-pt-3 oui-pb-5"
              : "oui-px-5 oui-pt-3 oui-pb-5",
            "oui-gap-3",
          )}
        >
          <Text className="oui-text-sm oui-leading-8 oui-text-base-contrast-80">
            {"Set as"}
          </Text>

          <Button
            size="md"
            className={cn(
              "oui-bg-base-3 hover:oui-bg-base-3/80 active:oui-bg-base-3/70",
              selectedCount > 0 && !props.isLoading
                ? "oui-text-base-contrast-80"
                : "oui-text-base-contrast-98",
            )}
            disabled={selectedCount === 0 || props.isLoading}
            onClick={handleSetCross}
            aria-label="Cross"
            data-testid="oui-testid-marginModeSettings-set-cross"
          >
            {"Cross"}
          </Button>
          <Button
            size="md"
            className={cn(
              "oui-bg-base-3 hover:oui-bg-base-3/80 active:oui-bg-base-3/70",
              selectedCount > 0 && !props.isLoading
                ? "oui-text-base-contrast-80"
                : "oui-text-base-contrast-98",
            )}
            disabled={selectedCount === 0 || props.isLoading}
            onClick={handleSetIsolated}
            aria-label="Isolated"
            data-testid="oui-testid-marginModeSettings-set-isolated"
          >
            {"Isolated"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SymbolRow: FC<{
  item: MarginModeSettingsItem;
  checked: boolean;
  marginMode: MarginMode;
  onToggle: (key: string) => void;
}> = (props) => {
  const handleToggle = useCallback(() => {
    props.onToggle(props.item.key);
  }, [props]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        props.onToggle(props.item.key);
      }
    },
    [props],
  );

  return (
    <div
      role="checkbox"
      aria-checked={props.checked}
      tabIndex={0}
      className={cn(
        "oui-flex oui-w-full oui-items-center",
        "oui-cursor-pointer oui-select-none",
      )}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      data-testid={`oui-testid-marginModeSettings-item-${props.item.key}`}
    >
      <div className="oui-flex oui-items-center oui-gap-2">
        <Checkbox
          color="white"
          checked={props.checked}
          onCheckedChange={() => {
            props.onToggle(props.item.key);
          }}
          aria-label={props.item.symbol}
        />
        <Text className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
          {props.item.symbol}
        </Text>
        <span
          className={cn(
            "oui-inline-flex oui-items-center",
            "oui-rounded oui-bg-base-6 oui-px-2 oui-py-0",
            "oui-h-[18px] oui-text-xs oui-leading-[18px]",
            "oui-text-base-contrast-36",
          )}
        >
          {props.marginMode === "isolated" ? "Isolated" : "Cross"}
        </span>
      </div>
    </div>
  );
};

const SearchGlyph: FC<{ className?: string }> = (props) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M6.417 1.167a5.25 5.25 0 1 0 3.138 9.46l2.139 2.14a.583.583 0 1 0 .825-.826l-2.14-2.139a5.25 5.25 0 0 0-3.962-8.635Zm0 1.167a4.083 4.083 0 1 1 0 8.166 4.083 4.083 0 0 1 0-8.166Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
};
