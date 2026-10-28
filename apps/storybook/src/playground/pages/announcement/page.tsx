import { useNavigate } from "react-router";
import { useTranslation } from "@orderly.network/i18n";
import { ChevronLeftIcon, Text, useScreen } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout/baseLayout";
import { useNav } from "../../hooks/useNav";
import { AnnouncementWidget } from "./announcement.widget";

export default function AnnouncementPage() {
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onRouteChange } = useNav();

  const onBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      onRouteChange({ href: "/", name: "trading" });
    }
  };

  return (
    <BaseLayout
      topBar={
        isMobile ? (
          <div className="oui-announcement-mobile-nav oui-grid oui-h-12 oui-grid-cols-[40px_minmax(0,1fr)_40px] oui-items-center oui-px-5">
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={onBack}
              className="oui-flex oui-size-10 oui-items-center oui-justify-center oui-rounded oui-text-base-contrast-54 focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
            >
              <ChevronLeftIcon
                size={24}
                color="inherit"
                opacity={1}
                className="rtl:oui-rotate-180"
              />
            </button>
            <Text asChild size="base" weight="semibold" intensity={98}>
              <h1 className="oui-text-center">
                {t("notification.announcements")}
              </h1>
            </Text>
          </div>
        ) : undefined
      }
      classNames={{
        root: "lg:oui-overflow-y-scroll",
        bottomNav: "oui-hidden",
        content: isMobile
          ? "[&_.oui-announcement-title]:oui-hidden [&_.oui-announcement-center]:oui-pt-0 [&_.oui-announcement-navigation]:oui-mt-0"
          : undefined,
      }}
    >
      <AnnouncementWidget />
    </BaseLayout>
  );
}
