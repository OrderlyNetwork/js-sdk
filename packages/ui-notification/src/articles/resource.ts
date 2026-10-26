import type { ReadStatus } from "./model";

export type AnnouncementResourceState<T> = {
  rows: T[];
  total: number;
  last_updated_time: number;
  status: ReadStatus;
};

/** Serializes refreshes and retries each read independently of the other views. */
export class AnnouncementResource<T> {
  state: AnnouncementResourceState<T> = {
    rows: [],
    total: 0,
    last_updated_time: 0,
    status: "loading",
  };
  private active = true;
  private generation = 0;
  private dirty = false;
  private running?: Promise<void>;
  private timer?: ReturnType<typeof setTimeout>;
  private retries = 0;

  constructor(
    private readonly read: () => Promise<{
      rows: T[];
      total: number;
      last_updated_time: number;
    }>,
    private readonly changed: () => void,
    private readonly retain: (row: T) => boolean = () => true,
  ) {}

  start = () => {
    this.active = true;
    if (this.running) return this.running;
    return this.refresh();
  };

  stop = () => {
    this.active = false;
    this.generation++;
    this.running = undefined;
    clearTimeout(this.timer);
  };

  replaceRows = (rows: T[]) => {
    if (rows.length === this.state.rows.length) return;
    this.state = {
      ...this.state,
      rows,
    };
    this.changed();
  };

  refresh = (): Promise<void> => {
    if (!this.active) return Promise.resolve();
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = undefined;
    if (this.running) return this.running;
    const generation = this.generation;
    this.running = this.synchronize(generation).finally(() => {
      if (generation === this.generation) {
        this.running = undefined;
        if (this.dirty && this.active && !this.timer) void this.refresh();
      }
    });
    return this.running;
  };

  private async synchronize(generation: number) {
    while (this.dirty && this.active && generation === this.generation) {
      this.dirty = false;
      if (this.state.status === "error") {
        this.state = { ...this.state, status: "loading" };
        this.changed();
      }
      try {
        const data = await this.read();
        if (!this.active || generation !== this.generation) return;
        this.state = {
          ...data,
          rows: data.rows.filter(this.retain),
          status: "ready",
        };
        this.retries = 0;
        this.changed();
      } catch {
        if (!this.active || generation !== this.generation) return;
        this.state = { ...this.state, status: "error" };
        this.changed();
        this.timer = setTimeout(
          () => void this.refresh(),
          Math.min(30_000, 1000 * 2 ** Math.min(this.retries++, 5)),
        );
        return;
      }
    }
  }
}
