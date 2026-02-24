import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  type FC,
  type PropsWithChildren,
} from "react";
import { createEventsFacade, NOOP_EVENTS } from "./apis/events";
import { OrderlyPluginRegistry } from "./pluginRegistry";
import type {
  OrderlyPlugin,
  OrderlyPluginAPI,
  PluginRegistrationFn,
} from "./types";

export type ExtensionContextState = Record<string, never>;

export const ExtensionContext = createContext<ExtensionContextState>({});

export const useExtensionContext = () =>
  useContext<ExtensionContextState>(ExtensionContext);

export const ExtensionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const memoizedValue = useMemo<ExtensionContextState>(() => ({}), []);
  return (
    <ExtensionContext.Provider value={memoizedValue}>
      {children}
    </ExtensionContext.Provider>
  );
};

export interface OrderlyPluginContextValue {
  plugins: OrderlyPlugin[];
  apiFacade: OrderlyPluginAPI;
}

const DEFAULT_PLUGIN_CONTEXT: OrderlyPluginContextValue = {
  plugins: [],
  apiFacade: { events: NOOP_EVENTS },
};

export const OrderlyPluginContext =
  createContext<OrderlyPluginContextValue | null>(null);

export const useOrderlyPluginContext = (): OrderlyPluginContextValue => {
  const context = useContext(OrderlyPluginContext);
  return context ?? DEFAULT_PLUGIN_CONTEXT;
};

export interface OrderlyPluginProviderProps extends PropsWithChildren {
  plugins: (OrderlyPlugin | PluginRegistrationFn)[];
  /** Optional state passed to plugin registration fns (e.g. AppState) */
  pluginState?: unknown;
}

export const OrderlyPluginProvider: FC<OrderlyPluginProviderProps> = ({
  plugins,
  pluginState,
  children,
}) => {
  const resolvedPlugins = useMemo(() => {
    const collected: OrderlyPlugin[] = [];
    const sdk = {
      registerPlugin: (descriptor: OrderlyPlugin) => collected.push(descriptor),
    };
    plugins.forEach((p) => {
      if (typeof p === "function") {
        p(sdk, pluginState);
      } else {
        collected.push(p);
      }
    });
    return [...collected, ...OrderlyPluginRegistry.getPlugins()];
  }, [plugins, pluginState]);

  const apiFacade = useMemo<OrderlyPluginAPI>(
    () => ({ events: createEventsFacade() }),
    [],
  );

  useEffect(() => {
    resolvedPlugins.forEach((plugin) => {
      if (typeof plugin.setup === "function") {
        try {
          plugin.setup(apiFacade);
        } catch (e) {
          console.error(`[Plugin ${plugin.id}] setup failed:`, e);
        }
      }
    });
  }, [resolvedPlugins, apiFacade]);

  const value = useMemo<OrderlyPluginContextValue>(
    () => ({ plugins: resolvedPlugins, apiFacade }),
    [resolvedPlugins, apiFacade],
  );

  return (
    <OrderlyPluginContext.Provider value={value}>
      {children}
    </OrderlyPluginContext.Provider>
  );
};
