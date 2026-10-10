import { createOrderKeyRegistry } from "./orderKeyRegistry";

describe("order cache key ownership", () => {
  it("keeps another consumer registered and releases the final consumer", () => {
    const registry = createOrderKeyRegistry();
    const first = () => "first";
    const second = () => "second";
    const releaseFirst = registry.register("orders", first);
    const releaseSecond = registry.register("orders", second);
    releaseSecond();
    expect(registry.handlers.get("orders")).toBe(first);
    releaseSecond();
    expect(registry.handlers.get("orders")).toBe(first);
    releaseFirst();
    expect(registry.handlers.size).toBe(0);
  });
  it("preserves legacy cache retention without accumulating released registrations", () => {
    const registry = createOrderKeyRegistry();
    const persistent = () => "persistent";
    registry.register("orders", persistent, true)();
    const release = registry.register("orders", () => "temporary");
    release();
    expect(registry.handlers.get("orders")).toBe(persistent);
    registry.unregister("orders");
    expect(registry.handlers.size).toBe(0);
  });
  it("does not let a late cleanup remove a new registration after explicit clearing", () => {
    const registry = createOrderKeyRegistry();
    const releaseOld = registry.register("orders", () => "old");
    registry.unregister("orders");
    const current = () => "current";
    const releaseCurrent = registry.register("orders", current);
    releaseOld();
    expect(registry.handlers.get("orders")).toBe(current);
    releaseCurrent();
    expect(registry.handlers.size).toBe(0);
  });
});
