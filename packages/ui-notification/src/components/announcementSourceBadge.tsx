import { useTranslation } from "@orderly.network/i18n";
import { Badge, cn } from "@orderly.network/ui";

/**
 * Presentation options for a known announcement source badge.
 */
export type AnnouncementSourceBadgeProps = {
  /** True labels System, false labels the platform, and undefined hides the badge. */
  isOfficial?: boolean;
  /** Platform label; a blank/absent value uses the translated Platform fallback. */
  platformName?: string;
  /** Additional badge classes. */
  className?: string;
};

/**
 * Displays an official or platform source label.
 * @returns The source badge, or null when isOfficial is not known.
 */
export function AnnouncementSourceBadge({
  isOfficial,
  platformName,
  className,
}: AnnouncementSourceBadgeProps) {
  const { t } = useTranslation();
  // Unknown legacy sources must not be presented as official or platform-owned.
  if (typeof isOfficial !== "boolean") return null;
  const label = isOfficial
    ? t("notification.source.system")
    : platformName?.trim() || t("notification.source.platform");
  return (
    <Badge
      color={isOfficial ? "neutral" : "primary"}
      size="xs"
      data-announcement-source={isOfficial ? "official" : "platform"}
      title={label}
      aria-label={t("notification.source.label", { name: label })}
      className={cn(
        "oui-max-w-[140px] oui-shrink-0 oui-align-middle",
        className,
      )}
    >
      <span className="oui-min-w-0 oui-truncate">{label}</span>
    </Badge>
  );
}
