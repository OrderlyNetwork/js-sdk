import { describe, expect, it, vi } from "vitest";
import {
  refreshAccountOrderQueries,
  registerOrderQueryRefresh,
} from "@orderly.network/hooks/src/utils/orderQueryRefresh";

describe("account order cache refresh", () => {
  it("deduplicates bound queries and refreshes only the current account/cache", async () => {
    const cache = {};
    const refresh = vi.fn(async () => undefined);
    const duplicate = vi.fn(async () => undefined);
    const algo = vi.fn(async () => undefined);
    const excluded = vi.fn(async () => undefined);
    registerOrderQueryRefresh(cache, "/v1/orders?page=1", "a", refresh);
    const remove = registerOrderQueryRefresh(
      cache,
      "/v1/orders?page=1",
      "a",
      duplicate,
    );
    registerOrderQueryRefresh(cache, "/v1/algo/orders?page=1", "a", algo);
    registerOrderQueryRefresh(cache, "/v1/orders?page=1", "b", excluded);
    registerOrderQueryRefresh({}, "/v1/orders?page=1", "a", excluded);
    registerOrderQueryRefresh(cache, "/v1/positions", "a", excluded);
    await refreshAccountOrderQueries(cache, "a", () => true);
    expect(refresh).toHaveBeenCalledOnce();
    expect(algo).toHaveBeenCalledOnce();
    expect(duplicate).not.toHaveBeenCalled();
    expect(excluded).not.toHaveBeenCalled();
    remove();
  });

  it("removes unmounted queries and checks the account immediately before refreshing", async () => {
    const cache = {};
    const refresh = vi.fn(async () => undefined);
    const remove = registerOrderQueryRefresh(cache, "/v1/orders", "a", refresh);
    await refreshAccountOrderQueries(cache, "a", () => false);
    remove();
    await refreshAccountOrderQueries(cache, "a", () => true);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("awaits every query even if one refresh fails", async () => {
    const cache = {};
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const completed = vi.fn();
    registerOrderQueryRefresh(cache, "/v1/orders", "a", async () => {
      throw new Error("REFRESH_FAILED");
    });
    registerOrderQueryRefresh(cache, "/v1/algo/orders", "a", () => pending);
    const result = refreshAccountOrderQueries(cache, "a", () => true).then(
      completed,
    );
    await Promise.resolve();
    expect(completed).not.toHaveBeenCalled();
    finish();
    await result;
    expect(completed).toHaveBeenCalledOnce();
  });
});
