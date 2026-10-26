import { useTranslation } from "@orderly.network/i18n";
import { Badge, cn } from "@orderly.network/ui";

export type AnnouncementSourceBadgeProps = {
  isOfficial?: boolean;
  platformName?: string;
  className?: string;
};

export function AnnouncementSourceBadge({
  isOfficial,
  platformName,
  className,
}: AnnouncementSourceBadgeProps) {
  const { t } = useTranslation();
  // Unknown legacy sources must not be presented as official or platform-owned.
  if (typeof isOfficial !== "boolean") return null;
  const label = isOfficial
    ? t("notification.source.orderly")
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
