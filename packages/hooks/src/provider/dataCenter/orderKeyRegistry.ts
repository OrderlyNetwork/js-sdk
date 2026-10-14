import type { getKeyFunction } from "./dataCenterContext";

/** Preserve other consumers when a view releases a shared order cache key. */
export function createOrderKeyRegistry() {
  const handlers = new Map<string, getKeyFunction>();
  const consumers = new Map<string, Map<symbol, getKeyFunction>>();
  const retained = new Map<string, getKeyFunction>();
  const retainedKeys = new Map<string, string>();
  const register = (
    key: string,
    handler: getKeyFunction,
    keepAfterRelease = false,
  ) => {
    const token = Symbol();
    const registrations = consumers.get(key) ?? new Map();
    registrations.set(token, handler);
    consumers.set(key, registrations);
    if (keepAfterRelease) {
      // Keep only the latest inactive URL per legacy scope. Active consumers
      // retain independent registrations for different dates and pages.
      const scope = key.split("#")[0];
      const previous = retainedKeys.get(scope);
      if (previous && previous !== key) {
        retained.delete(previous);
        if (!consumers.has(previous)) handlers.delete(previous);
      }
      retainedKeys.set(scope, key);
      retained.set(key, handler);
    }
    handlers.set(key, handler);
    return () => {
      registrations.delete(token);
      if (consumers.get(key) !== registrations) return;
      if (!registrations.size) {
        consumers.delete(key);
        const persistent = retained.get(key);
        if (persistent) handlers.set(key, persistent);
        else handlers.delete(key);
      } else {
        handlers.set(key, [...registrations.values()].at(-1)!);
      }
    };
  };
  return {
    handlers,
    register,
    unregister: (key: string) => {
      consumers.delete(key);
      retained.delete(key);
      const scope = key.split("#")[0];
      if (retainedKeys.get(scope) === key) retainedKeys.delete(scope);
      handlers.delete(key);
    },
  };
}
