/**
 * @orderly.network/layout-core
 *
 * Core layout strategy protocol and runtime glue for Orderly layout system.
 * This package provides the interface definitions and utilities that all
 * layout strategies must implement, without binding to any specific third-party
 * layout library.
 */

// Types
export type {
  LayoutCapabilities,
  LayoutModel,
  PanelRegistry,
  OnLayoutChange,
  LayoutStrategy,
  LayoutRendererProps,
  LayoutHostProps,
  StrategyResolverOptions,
} from "./types";

// Components
export { LayoutHost } from "./LayoutHost";

// Hooks
export { useLayoutPersistence } from "./hooks/useLayoutPersistence";

// Utils
export { resolveStrategy } from "./utils/strategyResolver";
