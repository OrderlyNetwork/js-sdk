import { createElement, type ReactNode } from "react";
import MarkdownIt from "markdown-it";
import { AnnouncementVideo } from "./announcementVideo";

export interface MarkdownToken {
  type: string;
  tag: string;
  nesting: number;
  content: string;
  children?: MarkdownToken[];
  hidden?: boolean;
  attrGet(name: string): string | null;
}

const parser = new MarkdownIt({ html: false, linkify: false, breaks: true });

export function safeHttpsUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}

// Keep these URL rules aligned with dex-creator's normalizeBlogPostVideoUrl.
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_VIDEO_ID_PATTERN = /^[1-9]\d{0,11}$/;
const VIDEO_EMBED_MARKER = "embed-video";

export function videoEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const path = url.pathname.split("/").filter(Boolean);
    let videoId: string | null = null;

    if (hostname === "youtu.be" && path.length === 1) {
      videoId = path[0] ?? null;
    } else if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (
        path.length === 2 &&
        (path[0] === "shorts" || path[0] === "embed")
      ) {
        videoId = path[1] ?? null;
      }
    } else if (
      (hostname === "youtube-nocookie.com" ||
        hostname === "www.youtube-nocookie.com") &&
      path.length === 2 &&
      path[0] === "embed"
    ) {
      videoId = path[1] ?? null;
    }

    if (videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    videoId = null;
    if (
      (hostname === "vimeo.com" || hostname === "www.vimeo.com") &&
      path.length === 1
    ) {
      videoId = path[0] ?? null;
    } else if (
      hostname === "player.vimeo.com" &&
      path.length === 2 &&
      path[0] === "video"
    ) {
      videoId = path[1] ?? null;
    }

    if (videoId && VIMEO_VIDEO_ID_PATTERN.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

function markedVideoEmbed(token: MarkdownToken, label: string): string | null {
  return token.attrGet("title") === VIDEO_EMBED_MARKER ||
    label.startsWith("Video: ")
    ? videoEmbedUrl(token.attrGet("href") ?? "")
    : null;
}

/** Summaries exclude media, raw HTML and code; all three entrances use this text. */
export function announcementExcerpt(content: string): string {
  const stripped = content
    .replace(/<([a-z][\w:-]*)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<[^>]*>/g, "");
  const collect = (tokens: MarkdownToken[]): string => {
    let skipUntil = -1;
    return tokens
      .map((token, index) => {
        if (index <= skipUntil) return "";
        if (
          token.type === "link_open" &&
          markedVideoEmbed(
            token,
            tokens[index + 1]?.type === "text" ? tokens[index + 1].content : "",
          )
        ) {
          const closing = tokens.findIndex(
            (item, next) => next > index && item.type === "link_close",
          );
          if (closing >= 0) skipUntil = closing;
          return "";
        }
        if (token.type === "text") return token.content;
        if (token.type === "softbreak" || token.type === "hardbreak")
          return " ";
        if (token.type === "inline") return `${collect(token.children ?? [])} `;
        return "";
      })
      .join("");
  };
  return collect(parser.parse(stripped, {})).replace(/\s+/g, " ").trim();
}

const classes: Record<string, string> = {
  p: "oui-leading-7",
  h1: "oui-text-2xl oui-font-semibold oui-text-base-contrast-98",
  h2: "oui-text-xl oui-font-semibold oui-text-base-contrast-98",
  h3: "oui-text-lg oui-font-semibold oui-text-base-contrast-98",
  h4: "oui-font-semibold",
  h5: "oui-font-semibold",
  h6: "oui-font-semibold",
  ul: "oui-list-disc oui-space-y-2 oui-ps-6",
  ol: "oui-list-decimal oui-space-y-2 oui-ps-6",
  li: "oui-leading-7",
  blockquote:
    "oui-border-s-2 oui-border-primary oui-bg-base-8 oui-p-4 oui-text-base-contrast-54",
  pre: "oui-overflow-x-auto oui-rounded-md oui-bg-base-8 oui-p-4 oui-text-xs",
  code: "oui-rounded oui-bg-base-8 oui-px-1 oui-font-mono oui-text-xs",
  table: "oui-w-full oui-border-collapse oui-text-start",
  th: "oui-border oui-border-line-12 oui-p-3 oui-text-start oui-font-semibold",
  td: "oui-border oui-border-line-12 oui-p-3",
  hr: "oui-border-line-6",
  strong: "oui-font-semibold oui-text-base-contrast-98",
  em: "oui-italic",
};
const allowedTags = new Set([
  ...Object.keys(classes),
  "thead",
  "tbody",
  "tr",
  "s",
]);

/** Render parser tokens as React nodes. No raw HTML or arbitrary token attributes. */
function renderTokens(tokens: MarkdownToken[]): ReactNode[] {
  let cursor = 0;
  function read(): ReactNode[] {
    const result: ReactNode[] = [];
    while (cursor < tokens.length) {
      const token = tokens[cursor++];
      if (token.nesting === -1) break;
      const key = cursor;
      if (token.type === "inline")
        result.push(...renderTokens(token.children ?? []));
      else if (token.type === "text") result.push(token.content);
      else if (token.type === "softbreak" || token.type === "hardbreak")
        result.push(createElement("br", { key }));
      else if (token.type === "image") {
        const src = safeHttpsUrl(token.attrGet("src"));
        if (src)
          result.push(
            createElement("img", {
              key,
              src,
              alt: token.content,
              loading: "lazy",
              className: "oui-max-w-full oui-rounded-md",
            }),
          );
      } else if (token.type === "fence" || token.type === "code_block") {
        result.push(
          createElement(
            "pre",
            { key, className: classes.pre },
            createElement("code", null, token.content),
          ),
        );
      } else if (token.type === "code_inline") {
        result.push(
          createElement(
            "code",
            { key, className: classes.code },
            token.content,
          ),
        );
      } else if (token.nesting === 1) {
        const children = read();
        if (token.hidden) result.push(...children);
        else if (token.tag === "a") {
          const href = safeHttpsUrl(token.attrGet("href"));
          const label = children.every((child) => typeof child === "string")
            ? children.join("")
            : "";
          const embed = markedVideoEmbed(token, label);
          if (embed) {
            result.push(
              createElement(AnnouncementVideo, {
                key: `${key}:${embed}`,
                src: embed,
                title:
                  (label.startsWith("Video: ") ? label.slice(7) : label) ||
                  "Video",
              }),
            );
            continue;
          }
          result.push(
            href
              ? createElement(
                  "a",
                  {
                    key,
                    href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "oui-text-primary-light oui-underline",
                  },
                  children,
                )
              : createElement("span", { key }, children),
          );
        } else if (allowedTags.has(token.tag)) {
          const element = createElement(
            token.tag,
            { key, className: classes[token.tag] },
            children,
          );
          result.push(
            token.tag === "table"
              ? createElement(
                  "div",
                  { key, className: "oui-overflow-x-auto" },
                  element,
                )
              : element,
          );
        } else result.push(...children);
      } else if (token.tag === "hr")
        result.push(createElement("hr", { key, className: classes.hr }));
    }
    return result;
  }
  return read();
}

export function AnnouncementMarkdown({ content }: { content: string }) {
  return (
    <div className="oui-announcement-markdown oui-text-sm oui-space-y-6 oui-break-words oui-font-normal oui-text-base-contrast-80">
      {renderTokens(parser.parse(content, {}))}
    </div>
  );
}
