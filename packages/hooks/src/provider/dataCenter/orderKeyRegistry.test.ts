import { createOrderKeyRegistry } from "./orderKeyRegistry";

describe("order cache key ownership", () => {
  it("keeps independent active URLs and only the latest retained URL per scope", () => {
    const registry = createOrderKeyRegistry();
    const first = "orders:BUY:50:PERP#/v1/orders?start_t=1";
    const second = "orders:BUY:50:PERP#/v1/orders?start_t=2";
    const releaseFirst = registry.register(first, () => "first", true);
    const releaseSecond = registry.register(second, () => "second", true);
    expect(registry.handlers.size).toBe(2);
    releaseFirst();
    expect(registry.handlers.has(first)).toBe(false);
    releaseSecond();
    expect(registry.handlers.has(second)).toBe(true);
    for (let i = 3; i < 20; i++)
      registry.register(
        `orders:BUY:50:PERP#/v1/orders?start_t=${i}`,
        () => "url",
        true,
      )();
    expect(registry.handlers.size).toBe(1);
  });
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
