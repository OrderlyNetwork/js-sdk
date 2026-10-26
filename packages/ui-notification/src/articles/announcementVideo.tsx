import { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";

const LOAD_TIMEOUT_MS = 15_000;

/** The parent keys this component by its canonical embed URL. */
export function AnnouncementVideo({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "loaded" | "timeout">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const url = new URL(src);
  const youtube = url.hostname === "www.youtube-nocookie.com";
  const provider = youtube ? "YouTube" : "Vimeo";
  const videoId = url.pathname.split("/").pop();
  const externalUrl = youtube
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://vimeo.com/${videoId}`;

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("timeout"), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  return (
    <span className="oui-relative oui-my-6 oui-block oui-aspect-video oui-w-full oui-overflow-hidden oui-rounded-md oui-border oui-border-line-6 oui-bg-base-8/30">
      <iframe
        key={attempt}
        src={src}
        title={title}
        className={`oui-absolute oui-inset-0 oui-h-full oui-w-full oui-border-0 oui-transition-opacity motion-reduce:oui-transition-none ${status === "loaded" ? "oui-opacity-100" : "oui-pointer-events-none oui-opacity-0"}`}
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={status === "loaded" ? 0 : -1}
        aria-hidden={status !== "loaded"}
        onLoad={() => setStatus("loaded")}
      />
      {status !== "loaded" && (
        <span className="oui-absolute oui-inset-0 oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-3 oui-p-4 oui-text-center oui-text-sm oui-text-base-contrast-54">
          {status === "loading" && (
            <span
              aria-hidden="true"
              className="oui-h-7 oui-w-7 oui-rounded-full oui-border-2 oui-border-line-12 oui-border-t-primary-light motion-safe:oui-animate-spin"
            />
          )}
          <span role="status" aria-live="polite">
            {t(
              status === "loading"
                ? "notification.video.loading"
                : "notification.video.slow",
            )}
          </span>
          {status === "timeout" && (
            <span className="oui-flex oui-flex-wrap oui-items-center oui-justify-center oui-gap-x-5 oui-gap-y-2">
              <button
                type="button"
                className="oui-rounded oui-px-2 oui-py-1 oui-text-primary-light hover:oui-underline focus-visible:oui-outline focus-visible:oui-outline-primary-light"
                onClick={() => {
                  setStatus("loading");
                  setAttempt((value) => value + 1);
                }}
              >
                {t("notification.video.reload")}
              </button>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="oui-rounded oui-px-2 oui-py-1 oui-text-primary-light hover:oui-underline focus-visible:oui-outline focus-visible:oui-outline-primary-light"
              >
                {t("notification.video.openExternal", { provider })}
              </a>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
