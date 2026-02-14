/**
 * Jest setup: isolate OrderlyExtensionRegistry singleton per test
 * by mocking getGlobalObject to a shared object we clear in tests that use the registry.
 */
const __globalStorage: Record<string, unknown> = {};

jest.mock("@orderly.network/utils", () => ({
  getGlobalObject: () => __globalStorage,
}));

/** Call in beforeEach to get a fresh OrderlyExtensionRegistry in the next getInstance() */
export function resetExtensionRegistry(): void {
  delete (__globalStorage as Record<string, unknown>).__ORDERLY_EXTENSION_REGISTRY__;
}
