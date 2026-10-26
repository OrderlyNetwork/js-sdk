import {
  registerOrderQueryRefresh,
  scheduleOrderQueryRefresh,
} from "./orderQueryRefresh";

describe("execution report query refresh scheduling", () => {
  const url = "/v1/orders?side=BUY&start_t=1";
  const accountId = "account";
  let cache: Map<string, unknown>;
  const current = () => true;
  const flush = async (ms: number) => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  };
  beforeEach(() => {
    jest.useFakeTimers();
    cache = new Map();
  });
  afterEach(() => jest.useRealTimers());

  it("coalesces reports per exact query and limits starts to once a second", async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const release = registerOrderQueryRefresh(cache, url, accountId, refresh);
    for (let i = 0; i < 10; i++)
      scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(200);
    expect(refresh).toHaveBeenCalledTimes(1);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(999);
    expect(refresh).toHaveBeenCalledTimes(1);
    await flush(1);
    expect(refresh).toHaveBeenCalledTimes(2);
    release();
  });

  it("queues one follow-up when reports arrive during a refresh", async () => {
    let resolve: () => void;
    const refresh = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((done) => {
            resolve = done;
          }),
      )
      .mockResolvedValue(undefined);
    const release = registerOrderQueryRefresh(cache, url, accountId, refresh);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(200);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(1500);
    expect(refresh).toHaveBeenCalledTimes(1);
    resolve!();
    await flush(0);
    await flush(200);
    expect(refresh).toHaveBeenCalledTimes(2);
    release();
  });

  it("deduplicates shared consumers and cancels when the last consumer releases", async () => {
    const first = jest.fn().mockResolvedValue(undefined);
    const second = jest.fn().mockResolvedValue(undefined);
    const releaseFirst = registerOrderQueryRefresh(
      cache,
      url,
      accountId,
      first,
    );
    const releaseSecond = registerOrderQueryRefresh(
      cache,
      url,
      accountId,
      second,
    );
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    releaseFirst();
    await flush(200);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    releaseSecond();
    await flush(1000);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("joins an in-flight refresh for activations without queuing another request", async () => {
    let resolve: () => void;
    const refresh = jest.fn().mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const release = registerOrderQueryRefresh(cache, url, accountId, refresh);
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(200);
    scheduleOrderQueryRefresh(cache, url, accountId, current, false);
    resolve!();
    await flush(0);
    await flush(1500);
    expect(refresh).toHaveBeenCalledTimes(1);
    release();
  });

  it("does not refresh a stale account or a replaced registration", async () => {
    let active = true;
    const refresh = jest.fn().mockResolvedValue(undefined);
    const release = registerOrderQueryRefresh(cache, url, accountId, refresh);
    scheduleOrderQueryRefresh(cache, url, accountId, () => active);
    active = false;
    await flush(200);
    expect(refresh).not.toHaveBeenCalled();
    active = true;
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    release();
    const releaseNew = registerOrderQueryRefresh(
      cache,
      url,
      accountId,
      refresh,
    );
    await flush(200);
    expect(refresh).not.toHaveBeenCalled();
    releaseNew();
  });

  it("isolates cache providers, accounts and URLs, and does not retry failures", async () => {
    const refresh = jest.fn().mockRejectedValue(new Error("network"));
    const release = registerOrderQueryRefresh(cache, url, accountId, refresh);
    scheduleOrderQueryRefresh(new Map(), url, accountId, current);
    scheduleOrderQueryRefresh(cache, url, "other", current);
    scheduleOrderQueryRefresh(cache, `${url}&end_t=2`, accountId, current);
    await flush(200);
    expect(refresh).not.toHaveBeenCalled();
    scheduleOrderQueryRefresh(cache, url, accountId, current);
    await flush(200);
    await flush(5000);
    expect(refresh).toHaveBeenCalledTimes(1);
    release();
  });
});
