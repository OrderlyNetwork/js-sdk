import type {
  InterceptorTargetPropsMap,
  KnownInterceptorTarget,
  PluginInterceptor,
  PluginInterceptorComponent,
} from "./types";

/**
 * Helper to create a typed interceptor. When UI packages augment InterceptorTargetPropsMap,
 * props in the component callback are inferred from the target path.
 * @param target - Interceptor path (e.g. 'Deposit.DepositForm')
 * @param component - (Original, props, api) => ReactNode; props typed from target
 * @returns PluginInterceptor suitable for use in OrderlyPlugin.interceptors
 */
export function createInterceptor<T extends KnownInterceptorTarget>(
  target: T,
  component: PluginInterceptorComponent<InterceptorTargetPropsMap[T]>,
): PluginInterceptor<InterceptorTargetPropsMap[T]> {
  return { target: target as string, component };
}
