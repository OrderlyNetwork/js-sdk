import { describe, expect, it } from "vitest";
import { resolveCardId } from "./cardSelection";

describe("current announcement after list refresh", () => {
  it("preserves the current ID when new announcements change its index", () => {
    expect(resolveCardId(2, [3, 2, 1], [4, 3, 2, 1])).toBe(2);
  });
  it("uses the old next article when the current one is removed", () => {
    expect(resolveCardId(2, [3, 2, 1], [4, 3, 1])).toBe(1);
  });
  it("uses the old previous article when the last one is removed", () => {
    expect(resolveCardId(1, [3, 2, 1], [4, 3, 2])).toBe(2);
  });
  it("skips other removed articles and closes when none remain", () => {
    expect(resolveCardId(3, [4, 3, 2, 1], [4, 1])).toBe(1);
    expect(resolveCardId(1, [1], [])).toBeUndefined();
  });
  it("starts a fresh session at the newest article", () => {
    expect(resolveCardId(undefined, [], [4, 3, 2])).toBe(4);
  });
});
