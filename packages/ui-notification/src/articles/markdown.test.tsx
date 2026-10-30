import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AnnouncementMarkdown,
  announcementExcerpt,
  safeHttpsUrl,
  videoEmbedUrl,
} from "./markdown";

describe("Markdown content", () => {
  it("retains root classes and the table scroll hook for rich article content", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown
        className="host-article"
        content={[
          "# Title",
          "[Read more](https://example.com)",
          "![Cover](https://example.com/image.png)",
          "| Header |\n| --- |\n| Cell |",
          "```js\nconst value = 1;\n```",
        ].join("\n\n")}
      />,
    );
    const rootClasses = markup.match(/^<div class="([^"]+)"/)?.[1].split(/\s+/);
    expect(rootClasses).toEqual(
      expect.arrayContaining([
        "host-article",
        "oui-announcement-markdown",
        "oui-notification-announcementMarkdown",
      ]),
    );
    expect(markup).toContain(
      "oui-notification-announcementMarkdown-table-scroll",
    );
  });

  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=share",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ])("embeds Blogpost markers for YouTube URL %s", (url) => {
    const content = `[Perp Anything](${url} "embed-video")`;
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown content={content} />,
    );
    expect(markup).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(markup).toContain('title="Perp Anything"');
    expect(markup).toContain(
      'allow="autoplay; encrypted-media; fullscreen; picture-in-picture"',
    );
    expect(markup).toContain(
      'referrerPolicy="strict-origin-when-cross-origin"',
    );
    expect(announcementExcerpt(`${content}\n\nVisible text`)).toBe(
      "Visible text",
    );
  });
  it("handles reference markers and formatted labels while preserving ordinary links", () => {
    const content = [
      "[**Perp** Anything][video]",
      '[video]: https://youtu.be/dQw4w9WgXcQ "embed-video"',
      "[Ordinary video](https://youtu.be/dQw4w9WgXcQ)",
      '[Vimeo](https://player.vimeo.com/video/123456789 "embed-video")',
    ].join("\n\n");
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown content={content} />,
    );
    expect((markup.match(/<iframe/g) ?? []).length).toBe(2);
    expect(markup).toContain('src="https://player.vimeo.com/video/123456789"');
    expect(markup).toContain('href="https://youtu.be/dQw4w9WgXcQ"');
    expect(announcementExcerpt(content)).toBe("Ordinary video");
  });
  it.each([
    "http://youtu.be/dQw4w9WgXcQ",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://user:secret@youtu.be/dQw4w9WgXcQ",
    "https://youtu.be:8443/dQw4w9WgXcQ",
    "https://youtu.be/invalid",
    "https://www.youtube.com/not-watch?v=dQw4w9WgXcQ",
    "https://vimeo.com/0",
  ])("does not embed unsupported marked URL %s", (url) => {
    const content = `[Invalid video](${url} "embed-video")`;
    expect(videoEmbedUrl(url)).toBeNull();
    expect(
      renderToStaticMarkup(<AnnouncementMarkdown content={content} />),
    ).not.toContain("<iframe");
    expect(announcementExcerpt(content)).toBe("Invalid video");
  });
  it("embeds only explicit video markers and excludes videos from excerpts", () => {
    const url = "https://youtu.be/dQw4w9WgXcQ";
    const video = `[Video: Demo](${url})`;
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown
        content={`${video}\n\n[Ordinary video link](${url})`}
      />,
    );
    expect(markup).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(markup).toContain(`href="${url}"`);
    expect((markup.match(/<iframe/g) ?? []).length).toBe(1);
    expect(announcementExcerpt(video)).toBe("");
    expect(announcementExcerpt(`${video}\n\nVisible text`)).toBe(
      "Visible text",
    );
  });
  it("rejects credentials and lookalike video hosts", () => {
    expect(
      videoEmbedUrl("https://www.youtube.com.evil.test/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
    expect(
      videoEmbedUrl("https://user:secret@youtu.be/dQw4w9WgXcQ"),
    ).toBeNull();
    expect(videoEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
  });
  it("renders headings, lists, quotes, emphasis, tables, and escaped code", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown
        content={
          "## Details\n\n**Bold** and *italic*.\n\n- First\n- Second\n\n> Quote\n\n| Market | Time |\n| --- | --- |\n| SOL | 12:00 |\n\n```html\n<script>alert(1)</script>\n```"
        }
      />,
    );
    for (const tag of [
      "h2",
      "strong",
      "em",
      "ul",
      "li",
      "blockquote",
      "table",
      "th",
      "td",
      "pre",
      "code",
    ])
      expect(markup).toContain(`<${tag}`);
    expect(markup).not.toContain("<script>");
    expect(markup).toContain("&lt;script&gt;");
  });
  it("does not execute arbitrary HTML and only permits HTTPS links/media", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementMarkdown
        content={
          "<img src=x onerror=alert(1)>\n\n[unsafe](javascript:alert(1)) [safe](https://example.com/)\n\n![image](https://example.com/image.png)\n\n![insecure](http://example.com/image.png)"
        }
      />,
    );
    expect(markup).not.toContain("<img src=x");
    expect(markup).not.toContain('href="javascript:');
    expect(markup).toContain('target="_blank" rel="noopener noreferrer"');
    expect(markup).toContain('src="https://example.com/image.png"');
    expect(markup).not.toContain('src="http://');
  });
  it("creates a clean excerpt without media, HTML, or code", () => {
    expect(
      announcementExcerpt(
        "**Hello** [world](https://example.com/)\n\n![cover](https://example.com/a.png)\n\n```js\nsecretCode()\n```\n\n`inlineCode()`\n\n<script>hidden()</script>",
      ),
    ).toBe("Hello world");
    expect(announcementExcerpt("![cover](https://example.com/a.png)")).toBe("");
  });
  it.each([
    "javascript:alert(1)",
    "data:image/png;base64,x",
    "http://example.com",
    "https://user:password@example.com",
    "/relative",
  ])("rejects unsafe external URLs %s", (url) => {
    expect(safeHttpsUrl(url)).toBeUndefined();
  });
});
