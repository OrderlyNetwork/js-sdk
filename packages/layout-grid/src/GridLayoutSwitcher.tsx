/**
 * Layout preset switcher: dropdown to let the end user choose which grid layout preset to use.
 * Must be rendered inside GridPresetProvider (e.g. when grid plugin is active). Renders nothing if context is missing.
 */
import React from "react";
import { useGridPresetContext } from "./GridPresetContext";

export interface GridLayoutSwitcherProps {
  /** Optional className for the root element (e.g. the <select>). */
  className?: string;
  /** Optional inline style. */
  style?: React.CSSProperties;
  /** Optional aria-label for accessibility. */
  "aria-label"?: string;
}

/**
 * Renders a <select> listing all presets; changing selection updates context and localStorage.
 */
export function GridLayoutSwitcher({
  className,
  style,
  "aria-label": ariaLabel = "Grid layout preset",
}: GridLayoutSwitcherProps): React.ReactElement | null {
  const ctx = useGridPresetContext();
  if (!ctx || ctx.presets.length === 0) return null;

  return (
    <select
      className={className}
      style={style}
      aria-label={ariaLabel}
      value={ctx.selectedPresetId}
      onChange={(e) => ctx.setSelectedPresetId(e.target.value)}
    >
      {ctx.presets.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
