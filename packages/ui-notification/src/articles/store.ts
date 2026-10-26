import { sortAnnouncements, type ReadStatus } from "./model";
import {
  AnnouncementResource,
  type AnnouncementResourceState,
} from "./resource";
import type {
  AnnouncementActiveResponse,
  AnnouncementApiCategory,
  AnnouncementArticle,
  AnnouncementCategory,
  AnnouncementListQuery,
  AnnouncementListResponse,
  AnnouncementListRow,
  AnnouncementSourceOptions,
  ContentLocale,
} from "./types";

export type DetailEntry = { status: ReadStatus; article?: AnnouncementArticle };
export type AnnouncementListState =
  AnnouncementResourceState<AnnouncementListRow>;
type Snapshot = {
  rows: AnnouncementListRow[];
  lastUpdatedTime: number;
  status: ReadStatus;
  details: Record<string, DetailEntry>;
  lists: Record<string, AnnouncementListState>;
  active: AnnouncementResourceState<AnnouncementArticle>;
  activeLocale: ContentLocale;
  cardOpen: boolean;
  reminderVersion: number;
};

const categories: Record<
  Exclude<AnnouncementCategory, "all">,
  AnnouncementApiCategory
> = {
  campaign: "CAMPAIGN",
  listing: "LISTINGS",
  delisting: "DELISTINGS",
  update: "UPDATES",
  legal: "LEGAL",
  others: "OTHERS",
};
export const emptyListState: AnnouncementListState = {
  rows: [],
  total: 0,
  last_updated_time: 0,
  status: "loading",
};
export function normalizeListQuery(query: AnnouncementListQuery = {}) {
  return {
    category: query.category ?? "all",
    page: Number.isSafeInteger(query.page) && query.page! > 0 ? query.page! : 1,
    size:
      Number.isSafeInteger(query.size) && query.size! > 0
        ? Math.min(100, query.size!)
        : 20,
  };
}
export const listQueryKey = (query: AnnouncementListQuery) =>
  JSON.stringify(normalizeListQuery(query));
export function announcementLocale(language: string): ContentLocale {
  const locale = language.toLowerCase().split(/[-_]/)[0];
  return ["en", "zh", "es", "fr", "ja", "ko"].includes(locale)
    ? (locale as ContentLocale)
    : "en";
}
export function announcementTopics({
  brokerId,
  excludeOfficial = false,
}: AnnouncementSourceOptions) {
  return [
    ...(!excludeOfficial ? ["orderly_official$announcement"] : []),
    ...(brokerId ? [`${brokerId}$announcement`] : []),
  ];
}
function sourceParams(options: AnnouncementSourceOptions) {
  const params = new URLSearchParams();
  if (options.brokerId) params.set("broker_id", options.brokerId);
  params.set("exclude_official", String(options.excludeOfficial ?? false));
  return params;
}
export function announcementQuery(
  options: AnnouncementSourceOptions & AnnouncementListQuery,
) {
  const params = sourceParams(options);
  if (options.category && options.category !== "all")
    params.set("category", categories[options.category]);
  if (options.page !== undefined || options.size !== undefined) {
    const { page, size } = normalizeListQuery(options);
    params.set("page", String(page));
    params.set("size", String(size));
  }
  return `/v2/public/announcement?${params}`;
}
export function announcementActiveQuery(
  options: AnnouncementSourceOptions,
  locale: ContentLocale,
) {
  const params = sourceParams(options);
  params.set("locale", locale);
  return `/v2/public/announcement/active?${params}`;
}

/** Source-scoped views share push verification, but never infer removal from a page. */
export class AnnouncementStore {
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();
  private bell: AnnouncementResource<AnnouncementListRow>;
  private cards: AnnouncementResource<AnnouncementArticle>;
  private queries = new Map<
    string,
    {
      resource: AnnouncementResource<AnnouncementListRow>;
      users: number;
    }
  >();
  private pending = new Map<string, number>();
  private handledNotifications = new Map<string, number>();
  private removed = new Map<string, number>();
  private knownVersions = new Map<string, number>();
  private cardReminders = new Map<
    string,
    { version: number; deadline: number }
  >();
  private detailRequests = new Map<
    string,
    Promise<AnnouncementArticle | undefined>
  >();
  private detailVersions = new Map<string, number>();
  private running?: Promise<void>;
  private dirty = false;
  private active = true;
  private generation = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private retries = 0;

  constructor(
    private readonly options: AnnouncementSourceOptions & {
      locale?: ContentLocale;
      list: (query: AnnouncementListQuery) => Promise<AnnouncementListResponse>;
      active: (locale: ContentLocale) => Promise<AnnouncementActiveResponse>;
      detail: (id: string) => Promise<AnnouncementArticle>;
      visible: (row: AnnouncementListRow) => boolean;
      onNotify: () => void;
    },
  ) {
    const locale = options.locale ?? "en";
    this.snapshot = {
      rows: [],
      lastUpdatedTime: 0,
      status: "loading",
      details: {},
      lists: {},
      active: { rows: [], total: 0, last_updated_time: 0, status: "loading" },
      activeLocale: locale,
      cardOpen: false,
      reminderVersion: 0,
    };
    this.bell = this.listResource({ page: 1, size: 5 });
    this.cards = this.cardResource(locale);
  }

  private get emptyScope() {
    return !this.options.brokerId && this.options.excludeOfficial;
  }
  private retained = (row: AnnouncementListRow) => {
    const removedAt = this.removed.get(String(row.announcement_id));
    return removedAt === undefined || row.updated_time > removedAt;
  };
  private listResource(
    query: AnnouncementListQuery,
  ): AnnouncementResource<AnnouncementListRow> {
    return new AnnouncementResource(
      async () => {
        const data = this.emptyScope
          ? { rows: [], total: 0, last_updated_time: 0 }
          : await this.options.list(query);
        return {
          ...data,
          rows: sortAnnouncements(data.rows),
        };
      },
      this.publish,
      this.retained,
    );
  }
  private cardResource(locale: ContentLocale) {
    return new AnnouncementResource(
      async () => {
        const data = this.emptyScope
          ? { rows: [], total: 0, last_updated_time: 0 }
          : await this.options.active(locale);
        return {
          ...data,
          rows: sortAnnouncements(data.rows),
        };
      },
      this.publish,
      this.retained,
    );
  }
  private publish = () => {
    const details = { ...this.snapshot.details };
    const rows = [
      this.bell.state.rows,
      this.cards.state.rows,
      ...[...this.queries.values()].map(({ resource }) => resource.state.rows),
    ].flat();
    for (const row of rows) {
      const id = String(row.announcement_id);
      this.knownVersions.set(
        id,
        Math.max(row.updated_time, this.knownVersions.get(id) ?? 0),
      );
      const cached = details[id]?.article;
      if (cached && row.updated_time > cached.updated_time) {
        this.invalidate(id);
        details[id] = { status: "loading" };
      }
    }
    let remind = false;
    if (this.cards.state.status === "ready") {
      for (const [id, { version, deadline }] of this.cardReminders) {
        const card = this.cards.state.rows.find(
          (row) =>
            String(row.announcement_id) === id && row.updated_time >= version,
        );
        if (card && deadline > Date.now() && this.options.visible(card))
          remind = true;
        if (card || deadline <= Date.now()) this.cardReminders.delete(id);
      }
    }
    this.snapshot = {
      ...this.snapshot,
      details,
      cardOpen: this.snapshot.cardOpen || remind,
      reminderVersion: this.snapshot.reminderVersion + (remind ? 1 : 0),
      rows: this.bell.state.rows,
      lastUpdatedTime: this.bell.state.last_updated_time,
      status: this.bell.state.status,
      active: this.cards.state,
      lists: Object.fromEntries(
        [...this.queries].map(([key, entry]) => [key, entry.resource.state]),
      ),
    };
    this.listeners.forEach((listener) => listener());
  };
  private update(change: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, ...change };
    this.listeners.forEach((listener) => listener());
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  closeTips = () => {
    this.cardReminders.clear();
    this.update({ cardOpen: false });
  };

  watchList = (query: AnnouncementListQuery) => {
    const key = listQueryKey(query);
    let entry = this.queries.get(key);
    if (!entry) {
      entry = {
        resource: this.listResource(normalizeListQuery(query)),
        users: 0,
      };
      this.queries.set(key, entry);
    }
    if (entry.users++ === 0 && this.active) void entry.resource.start();
    return () => {
      if (--entry.users === 0) entry.resource.stop();
    };
  };
  retryList = (query: AnnouncementListQuery) =>
    this.queries.get(listQueryKey(query))?.resource.refresh();
  retryBell = () => this.bell.refresh();
  setLocale = (locale: ContentLocale) => {
    if (locale === this.snapshot.activeLocale) return;
    this.cards.stop();
    this.cards = this.cardResource(locale);
    this.update({ activeLocale: locale, active: this.cards.state });
    if (this.active) void this.cards.start();
  };
  start = () => {
    this.active = true;
    void this.bell.start();
    void this.cards.start();
    for (const { resource, users } of this.queries.values())
      if (users) void resource.start();
  };
  stop = () => {
    this.active = false;
    this.generation++;
    clearTimeout(this.retryTimer);
    this.running = undefined;
    this.detailRequests.clear();
    this.bell.stop();
    this.cards.stop();
    for (const { resource } of this.queries.values()) resource.stop();
  };
  notify = (message: {
    announcement_id: string | number;
    updated_time?: number;
  }) => {
    if (!this.active || message?.announcement_id == null) return;
    const id = String(message.announcement_id);
    const version = message.updated_time ?? 0;
    if (
      version > (this.handledNotifications.get(id) ?? -1) &&
      (!this.pending.has(id) || version > this.pending.get(id)!)
    ) {
      this.pending.set(id, version);
      this.invalidate(id);
      if (this.snapshot.details[id])
        this.update({
          details: { ...this.snapshot.details, [id]: { status: "loading" } },
        });
    }
    void this.refresh();
  };
  private refreshViews = () =>
    Promise.all([
      this.bell.refresh(),
      this.cards.refresh(),
      ...[...this.queries.values()]
        .filter(({ users }) => users > 0)
        .map(({ resource }) => resource.refresh()),
    ]);
  refresh = (): Promise<void> => {
    if (!this.active) return Promise.resolve();
    this.dirty = true;
    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    // Every caller revalidates the views, including events arriving during a read.
    const views = this.refreshViews();
    if (!this.running) {
      const generation = this.generation;
      this.running = this.synchronize(generation).finally(() => {
        if (generation === this.generation) {
          this.running = undefined;
          if (this.dirty && this.active && !this.retryTimer)
            void this.refresh();
        }
      });
    }
    return Promise.all([views, this.running]).then(() => undefined);
  };

  private async synchronize(generation: number) {
    while (this.dirty && this.active && generation === this.generation) {
      this.dirty = false;
      const notifications = new Map(this.pending);
      let failed = false;
      for (const [id, version] of notifications) {
        try {
          const article = await this.requestDetail(id, true);
          if (!this.active || generation !== this.generation) return;
          if (this.pending.get(id) !== version) {
            this.dirty = true;
            continue;
          }
          if (article && article.updated_time < version)
            throw new Error("Announcement detail precedes notification");
          if (
            article &&
            this.options.visible(article) &&
            version > (this.handledNotifications.get(id) ?? -1)
          ) {
            this.options.onNotify();
            const deadline = article.notification_card_end_time;
            if (deadline != null && deadline > Date.now())
              this.cardReminders.set(id, {
                version: article.updated_time,
                deadline,
              });
            this.publish();
          }
          this.handledNotifications.set(
            id,
            Math.max(
              version,
              article?.updated_time ?? 0,
              this.handledNotifications.get(id) ?? 0,
            ),
          );
          this.pending.delete(id);
        } catch {
          failed = true;
        }
      }
      if (failed) {
        this.retryTimer = setTimeout(
          () => void this.refresh(),
          Math.min(30_000, 1000 * 2 ** Math.min(this.retries++, 5)),
        );
        return;
      }
      this.retries = 0;
    }
  }
  private invalidate(id: string) {
    this.detailVersions.set(id, (this.detailVersions.get(id) ?? 0) + 1);
    this.detailRequests.delete(id);
  }
  private remove(id: string) {
    this.removed.set(
      id,
      Math.max(
        this.pending.get(id) ?? 0,
        this.knownVersions.get(id) ?? 0,
        this.snapshot.details[id]?.article?.updated_time ?? 0,
        this.removed.get(id) ?? 0,
      ),
    );
    this.cardReminders.delete(id);
    const retain = (row: AnnouncementListRow) =>
      String(row.announcement_id) !== id;
    this.bell.replaceRows(this.bell.state.rows.filter(retain));
    this.cards.replaceRows(this.cards.state.rows.filter(retain));
    for (const { resource } of this.queries.values())
      resource.replaceRows(resource.state.rows.filter(retain));
  }
  /** Recovery never interprets a missing paginated row as an unpublished detail. */
  recover = () => {
    const details = { ...this.snapshot.details };
    for (const id of Object.keys(details)) {
      this.invalidate(id);
      details[id] = { status: "loading" };
    }
    this.update({ details });
    void this.refresh();
  };

  private requestDetail(
    id: string,
    force = false,
  ): Promise<AnnouncementArticle | undefined> {
    if (!this.active) return Promise.resolve(undefined);
    if (this.detailRequests.has(id)) return this.detailRequests.get(id)!;
    if (!force && this.snapshot.details[id]?.status === "ready")
      return Promise.resolve(this.snapshot.details[id].article);
    if (this.emptyScope) {
      this.update({
        details: { ...this.snapshot.details, [id]: { status: "ready" } },
      });
      return Promise.resolve(undefined);
    }
    this.invalidate(id);
    const version = this.detailVersions.get(id);
    const generation = this.generation;
    this.update({
      details: { ...this.snapshot.details, [id]: { status: "loading" } },
    });
    const current = () =>
      this.active &&
      generation === this.generation &&
      version === this.detailVersions.get(id);
    const request = this.options
      .detail(id)
      .then((article) => {
        if (!current()) throw new Error("Superseded announcement detail");
        if (String(article.announcement_id) !== id)
          throw new Error("Unexpected announcement ID");
        if (
          !this.retained(article) ||
          article.updated_time <
            Math.max(this.pending.get(id) ?? 0, this.knownVersions.get(id) ?? 0)
        )
          throw new Error("Announcement detail precedes notification");
        this.knownVersions.set(id, article.updated_time);
        const visible = this.options.visible(article);
        this.update({
          details: {
            ...this.snapshot.details,
            [id]: { status: "ready", article: visible ? article : undefined },
          },
        });
        return article;
      })
      .catch((error: { status?: number }) => {
        if (!current()) throw error;
        if (error?.status === 404) {
          this.remove(id);
          this.update({
            details: { ...this.snapshot.details, [id]: { status: "ready" } },
          });
          return undefined;
        }
        this.update({
          details: { ...this.snapshot.details, [id]: { status: "error" } },
        });
        throw error;
      })
      .finally(() => {
        if (current()) this.detailRequests.delete(id);
      });
    this.detailRequests.set(id, request);
    return request;
  }
  loadDetail = (id: string, force = false): Promise<void> =>
    this.requestDetail(id, force).then(
      () => undefined,
      () => undefined,
    );
}
