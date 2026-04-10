import { useEffect } from "react";
import { registerResources } from "../resourceBundles";
import type { AsyncResources, Resources } from "../types";
import { useLocaleCode } from "./useLocaleCode";

/**
 * Registers host-provided i18n resources into the shared i18n instance whenever
 * the active locale or `resources` reference changes.
 *
 * - When `resources` is a function, it is invoked for the current locale to
 *   load the bundle (e.g. from another bundle, backend, or runtime loader).
 * - When `resources` is a static map, all provided locale bundles are registered.
 *
 * Prefer a stable `resources` reference (e.g. `useCallback` for loaders, module
 * scope or `useMemo` for static maps) to avoid unnecessary re-registration.
 */
export function useRegisterExternalResources(
  resources?: Resources | AsyncResources,
) {
  const localeCode = useLocaleCode();

  useEffect(() => {
    registerResources(resources, localeCode);
  }, [localeCode, resources]);
}
