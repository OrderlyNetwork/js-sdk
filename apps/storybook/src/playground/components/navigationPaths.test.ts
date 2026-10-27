import { describe, expect, it } from "vitest";
import { localizeEntryPath, migratePredictionPath } from "../navigationPaths";

describe("SDK route compatibility", () => {
  it.each([
    ["/prediction", "/predict"],
    ["/zh/prediction/BTC%2F5M?x=1#orders", "/zh/predict/BTC%2F5M?x=1#orders"],
    ["/predictionish/BTC", "/predictionish/BTC"],
    ["/portfolio/prediction", "/portfolio/prediction"],
    ["/predict/BTC", "/predict/BTC"],
  ])("migrates only legacy route segments: %s", (path, expected) => {
    expect(migratePredictionPath(path)).toBe(expected);
  });

  it.each(["/prediction/BTC%2F5M", "/predict/BTC%2F5M"])(
    "preserves direct entry suffixes: %s",
    (pathname) => {
      expect(
        localizeEntryPath("zh", {
          pathname,
          search: "?network=test",
          hash: "#orders",
        }),
      ).toBe("/zh/predict/BTC%2F5M?network=test#orders");
    },
  );
});
