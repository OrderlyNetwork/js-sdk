// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementVideo } from "./announcementVideo";
import { AnnouncementMarkdown } from "./markdown";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { provider: string }) =>
      options ? `${key} ${options.provider}` : key,
  }),
}));

const src = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("announcement video loading", () => {
  it("forwards root classes while preserving the video layout", () => {
    const { container } = render(
      <AnnouncementVideo src={src} title="Demo" className="host-video" />,
    );
    expect(container.firstElementChild?.classList.contains("host-video")).toBe(
      true,
    );
    expect(
      container.firstElementChild?.classList.contains("oui-aspect-video"),
    ).toBe(true);
    expect(
      container.querySelector(".oui-notification-announcementVideo-spinner"),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("status")
        .classList.contains(
          "oui-notification-announcementVideo-status-message",
        ),
    ).toBe(true);
  });

  it("preserves a loaded player during text edits and resets when its video changes", () => {
    const content = '[Demo](https://youtu.be/dQw4w9WgXcQ "embed-video")';
    const { rerender } = render(<AnnouncementMarkdown content={content} />);
    const frame = screen.getByTitle("Demo");
    fireEvent.load(frame);
    rerender(<AnnouncementMarkdown content={`${content}\n\nNew text`} />);
    expect(screen.getByTitle("Demo")).toBe(frame);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(
      <AnnouncementMarkdown
        content={content.replace("dQw4w9WgXcQ", "abcdefghijk")}
      />,
    );
    expect(screen.getByTitle("Demo")).not.toBe(frame);
    expect(screen.getByRole("status").textContent).toBe(
      "notification.video.loading",
    );
  });
  it("shows a themed placeholder immediately and reveals the loaded frame", () => {
    render(<AnnouncementVideo src={src} title="Demo" />);
    const frame = screen.getByTitle("Demo");
    expect(screen.getByRole("status").textContent).toBe(
      "notification.video.loading",
    );
    expect(frame.getAttribute("aria-hidden")).toBe("true");
    expect(frame.getAttribute("tabindex")).toBe("-1");
    expect(frame.parentElement?.className).toContain("oui-bg-base-8");
    fireEvent.load(frame);
    expect(screen.queryByRole("status")).toBeNull();
    expect(frame.getAttribute("aria-hidden")).toBe("false");
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.queryByRole("status")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("offers timeout actions, remounts the frame on retry and restarts the timer", () => {
    render(<AnnouncementVideo src={src} title="Demo" />);
    const firstFrame = screen.getByTitle("Demo");
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByRole("status").textContent).toBe(
      "notification.video.slow",
    );
    const link = screen.getByRole("link", {
      name: "notification.video.openExternal YouTube",
    });
    expect(link.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    fireEvent.click(
      screen.getByRole("button", { name: "notification.video.reload" }),
    );
    expect(screen.getByTitle("Demo")).not.toBe(firstFrame);
    expect(screen.getByRole("status").textContent).toBe(
      "notification.video.loading",
    );
    act(() => vi.advanceTimersByTime(14_999));
    expect(screen.queryByRole("button")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("button")).toBeTruthy();
    fireEvent.load(screen.getByTitle("Demo"));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("provides the correct Vimeo fallback on timeout and cleans up on unmount", () => {
    const { unmount } = render(
      <AnnouncementVideo
        src="https://player.vimeo.com/video/123456789"
        title="Vimeo demo"
      />,
    );
    act(() => vi.advanceTimersByTime(15_000));
    expect(
      screen
        .getByRole("link", { name: "notification.video.openExternal Vimeo" })
        .getAttribute("href"),
    ).toBe("https://vimeo.com/123456789");
    fireEvent.click(screen.getByRole("button"));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
