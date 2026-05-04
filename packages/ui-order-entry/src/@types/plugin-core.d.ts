/**
 * Local fallback declaration for plugin-core target map.
 * This keeps ui-order-entry DTS generation stable in monorepo dev mode
 * when plugin-core dist types are not built yet.
 */
declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {}
}
