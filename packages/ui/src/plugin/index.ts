/**
 * Side-effect: augment InterceptorTargetPropsMap for typed interceptor props.
 */
import "./interceptorTargets";

/**
 * Re-export plugin system from @orderly.network/plugin-core for backward compatibility.
 * @deprecated Import from @orderly.network/plugin-core directly for new code
 */
export {
  installExtension,
  setExtensionBuilder,
  ExtensionSlot,
  OrderlyPluginProvider,
  useOrderlyPluginContext,
  useInjectedComponent,
  injectable,
  positionToPath,
  OrderlyPluginRegistry,
  createOrderlySDK,
  OrderlyExtensionRegistry,
  PluginErrorBoundary,
  createInterceptor,
  PluginScopeContext,
  PluginScopeProvider,
  usePluginScope,
  ExtensionProvider,
  useExtensionContext,
  type ExtensionPosition,
  ExtensionPositionEnum,
  type OrderlyPlugin,
  type OrderlyPluginAPI,
  type OrderlySDK,
  type PluginRegistrationFn,
  type PluginInterceptor,
  type PluginInterceptorComponent,
  type Extension,
  type ExtensionBuilder,
  type ExtensionOptions,
  type OrderlyPluginContextValue,
  type PluginScopeValue,
  type InterceptorTargetPropsMap,
  type KnownInterceptorTarget,
} from "@orderly.network/plugin-core";

export type { DepositFormProps } from "./plugins/deposit";
