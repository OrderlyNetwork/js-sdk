import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnouncementResource } from "./resource";

afterEach(() => {
  vi.useRealTimers();
});

describe("AnnouncementResource retry feedback", () => {
  it.each(["ready", "error"] as const)(
    "publishes loading immediately on retry before settling to %s",
    async (outcome) => {
      vi.useFakeTimers();
      const data = { rows: [1], total: 1, last_updated_time: 1 };
      let finish!: () => void;
      const pending = new Promise<typeof data>((resolve, reject) => {
        finish = () =>
          outcome === "ready" ? resolve(data) : reject(new Error("Offline"));
      });
      const read = vi
        .fn()
        .mockRejectedValueOnce(new Error("Offline"))
        .mockReturnValueOnce(pending);
      const statuses: string[] = [];
      const resource = new AnnouncementResource<number>(read, () => {
        statuses.push(resource.state.status);
      });

      try {
        await resource.start();
        expect(resource.state.status).toBe("error");

        const retry = resource.refresh();
        expect(resource.state.status).toBe("loading");
        expect(statuses).toEqual(["error", "loading"]);
        expect(read).toHaveBeenCalledTimes(2);

        finish();
        await retry;
        expect(resource.state.status).toBe(outcome);
        expect(statuses).toEqual(["error", "loading", outcome]);
        expect(resource.state.rows).toEqual(outcome === "ready" ? [1] : []);
      } finally {
        resource.stop();
      }
    },
  );

  it("keeps loaded content visible during a background refresh", async () => {
    const data = { rows: [1], total: 1, last_updated_time: 1 };
    let finish!: (value: typeof data) => void;
    const read = vi
      .fn()
      .mockResolvedValueOnce(data)
      .mockImplementationOnce(
        () => new Promise<typeof data>((resolve) => (finish = resolve)),
      );
    const changed = vi.fn();
    const resource = new AnnouncementResource<number>(read, changed);

    try {
      await resource.start();
      changed.mockClear();

      const refresh = resource.refresh();
      expect(resource.state.status).toBe("ready");
      expect(resource.state.rows).toEqual([1]);
      expect(changed).not.toHaveBeenCalled();

      finish(data);
      await refresh;
    } finally {
      resource.stop();
    }
  });
});
