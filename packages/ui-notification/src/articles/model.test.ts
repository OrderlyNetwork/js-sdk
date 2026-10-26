import { describe, expect, it } from "vitest";
import {
  localizeArticle,
  sortAnnouncements,
  toSummary,
  visibleAnnouncements,
} from "./model";
import type { AnnouncementArticle } from "./types";

const base: AnnouncementArticle = {
  announcement_id: 2,
  category: "CAMPAIGN",
  is_official: true,
  published_time: 1000,
  updated_time: 1000,
  translations: {
    en: { title: "Trading campaign", content: "Campaign details" },
    zh: { title: "交易活动", content: "活动详情" },
    es: { title: "Campaña de trading", content: "Detalles de la campaña" },
    fr: { title: "Campagne de trading", content: "Détails de la campagne" },
    ja: { title: "取引キャンペーン", content: "キャンペーンの詳細" },
    ko: { title: "트레이딩 캠페인", content: "캠페인 세부 정보" },
  },
};
const rows: AnnouncementArticle[] = [
  base,
  {
    ...base,
    announcement_id: 1,
    translations: {
      en: {
        title: "SOL listing",
        content: "SOL perpetual futures are available.",
      },
      zh: { title: "SOL 永续合约上线", content: "" },
    },
  },
];
describe("publication and content", () => {
  it("passes card deadlines to the carousel without removing reading data", () => {
    const article = {
      ...rows[0],
      notification_card_end_time: rows[0].published_time + 1000,
    };
    expect(
      toSummary(localizeArticle(article, "en")).notification_card_end_time,
    ).toBe(article.notification_card_end_time);
    expect(visibleAnnouncements([article])).toHaveLength(1);
  });
  it("preserves official and platform source metadata in all localized summaries", () => {
    for (const is_official of [true, false]) {
      for (const locale of ["en", "zh", "es", "fr", "ja", "ko"]) {
        const article = { ...rows[0], is_official };
        expect(toSummary(localizeArticle(article, locale)).is_official).toBe(
          is_official,
        );
      }
    }
  });
  it("orders by publication time, then descending numeric ID, ignoring edits", () => {
    const base = rows[0];
    const input = [
      { ...base, announcement_id: 2, updated_time: 9999999999999 },
      { ...base, announcement_id: 10 },
      { ...base, announcement_id: 9, published_time: base.published_time - 1 },
    ];
    expect(
      sortAnnouncements(input).map((item) => item.announcement_id),
    ).toEqual([10, 2, 9]);
    expect(input[0].announcement_id).toBe(2);
    expect(toSummary(localizeArticle(input[0], "en")).published_time).toBe(
      base.published_time,
    );
  });
  it.each(["en", "zh", "es", "fr", "ja", "ko"])(
    "uses a complete %s translation",
    (locale) => {
      expect(localizeArticle(rows[0], locale).contentLocale).toBe(locale);
    },
  );
  it("falls back the entire article and summary when a translation is incomplete", () => {
    const article = localizeArticle(rows[1], "zh");
    expect(article.title).toBe(rows[1].translations.en.title);
    expect(article.content).toBe(rows[1].translations.en.content);
    expect(toSummary(article).message).toContain("SOL perpetual futures");
  });
  it.each(["tc", "de", "jp", "xx"])(
    "falls back to English for unsupported %s",
    (locale) => {
      expect(localizeArticle(rows[0], locale).contentLocale).toBe("en");
    },
  );
  it("isolates broker scope and optionally includes official announcements", () => {
    const input = [
      { ...rows[0], announcement_id: 1, is_official: true },
      { ...rows[0], announcement_id: 2, is_official: false, broker_id: "a" },
      { ...rows[0], announcement_id: 3, is_official: false, broker_id: "b" },
    ];
    expect(
      visibleAnnouncements(input, "a").map((item) => item.announcement_id),
    ).toEqual([2, 1]);
    expect(
      visibleAnnouncements(input, "b", false).map(
        (item) => item.announcement_id,
      ),
    ).toEqual([3]);
    expect(
      visibleAnnouncements(input).map((item) => item.announcement_id),
    ).toEqual([1]);
    expect(
      visibleAnnouncements([
        { ...rows[0], is_official: false, broker_id: undefined },
      ]),
    ).toEqual([]);
  });
});
