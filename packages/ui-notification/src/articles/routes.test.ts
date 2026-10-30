import { describe, expect, it } from "vitest";
import { localizeArticle, toSummary } from "./model";
import { announcementDetailUrl, findAnnouncementBySlug } from "./routes";
import type { AnnouncementArticle } from "./types";

const article: AnnouncementArticle = {
  announcement_id: 55,
  slug: "release-notes",
  is_official: false,
  category: "UPDATES",
  published_time: 1,
  updated_time: 1,
  translations: { en: { title: "Release notes", content: "Body" } },
};

describe("announcement detail links", () => {
  it.each([true, false])(
    "shares the %s source link across localized summaries and page navigation",
    (is_official) => {
      const row = { ...article, is_official };
      const url = `/announcement/release-notes?is_official=${is_official}`;
      expect(announcementDetailUrl(row)).toBe(url);
      expect(toSummary(localizeArticle(row, "en"))).toMatchObject({
        url,
        slug: row.slug,
      });
      expect(
        announcementDetailUrl(
          row,
          new URLSearchParams("category=legal&page=3&is_official=invalid"),
        ),
      ).toBe(
        `/announcement/release-notes?category=legal&page=3&is_official=${is_official}`,
      );
    },
  );
  it.each([
    { ...article, slug: undefined },
    { ...article, slug: "" },
    { ...article, is_official: undefined },
  ])("falls back to an ID without inventing source metadata", (row) => {
    expect(announcementDetailUrl(row)).toBe("/announcement/55");
    expect(
      announcementDetailUrl(
        row,
        new URLSearchParams("page=2&is_official=true"),
      ),
    ).toBe("/announcement/55?page=2");
  });
  it("preserves explicit adapter URLs and encodes route segments", () => {
    const row = { ...article, url: "https://example.com/custom" };
    expect(announcementDetailUrl(row)).toBe(row.url);
    expect(toSummary(localizeArticle(row, "en")).url).toBe(row.url);
    expect(announcementDetailUrl({ ...article, slug: "custom/slug" })).toBe(
      "/announcement/custom%2Fslug?is_official=false",
    );
  });
  it("defaults to platform, never falls back to official, and rejects duplicate matches", () => {
    const official = { ...article, announcement_id: 90, is_official: true };
    expect(findAnnouncementBySlug([official, article], "release-notes")).toBe(
      article,
    );
    expect(
      findAnnouncementBySlug([official, article], "release-notes", true),
    ).toBe(official);
    expect(findAnnouncementBySlug([official], "release-notes")).toBeUndefined();
    expect(
      findAnnouncementBySlug(
        [article, { ...article, announcement_id: 56 }],
        "release-notes",
      ),
    ).toBeUndefined();
  });
});
