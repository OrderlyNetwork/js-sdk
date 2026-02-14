import React, { useMemo, type ComponentType } from "react";
import { useOrderlyPluginContext } from "./pluginContext";
import { PluginErrorBoundary } from "./PluginErrorBoundary";
import { PluginScopeProvider } from "./pluginScopeContext";

/**
 * Returns a component that chains all interceptors for the given path (onion model).
 * Each interceptor is wrapped in PluginErrorBoundary; plugin's onError/onFallback
 * are used when provided, else SDK defaults.
 */
export function useInjectedComponent<P extends object>(
  name: string,
  DefaultComponent: ComponentType<P>
): ComponentType<P> {
  const { plugins, apiFacade } = useOrderlyPluginContext();

  return useMemo(() => {
    const interceptorsWithPlugin = plugins.flatMap((p) =>
      (p.interceptors ?? [])
        .filter((i) => i.target === name)
        .map((i) => ({
          ...i,
          pluginId: p.id,
          pluginName: p.name,
          pluginVersion: p.version,
          onError: p.onError,
          onFallback: p.onFallback,
        }))
    );

    if (interceptorsWithPlugin.length === 0) {
      return DefaultComponent;
    }

    let CurrentRender: ComponentType<P> = (props: P) => (
      <DefaultComponent {...props} />
    );

    interceptorsWithPlugin.forEach((interceptor) => {
      const {
        pluginId,
        pluginName,
        pluginVersion,
        component,
        onError,
        onFallback,
      } = interceptor;
      const PreviousRender = CurrentRender;
      CurrentRender = (props: P) => (
        <PluginScopeProvider
          pluginId={pluginId}
          pluginName={pluginName}
          pluginVersion={pluginVersion}
        >
          <PluginErrorBoundary
            pluginId={pluginId}
            onError={onError}
            onFallback={onFallback}
          >
            {component(PreviousRender as any, props, apiFacade)}
          </PluginErrorBoundary>
        </PluginScopeProvider>
      );
    });

    return CurrentRender;
  }, [plugins, apiFacade, name, DefaultComponent]);
}
