import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  ChevronRightIcon,
  Divider,
  Flex,
  InjectableEmptyDataState,
  Text,
  PaginationItems,
  cn,
} from "@orderly.network/ui";
import { AnnouncementMarkdown } from "../articles/markdown";
import { announcementCategories } from "../articles/types";
import { AnnouncementSourceBadge } from "../components/announcementSourceBadge";
import type { AnnouncementCenterScriptReturns } from "./announcementCenter.script";

const categoryKeys = {
  all: "common.all",
  campaign: "notification.category.campaign",
  listing: "notification.category.listing",
  delisting: "notification.category.delisting",
  update: "notification.category.update",
  legal: "notification.category.legal",
  others: "notification.category.others",
} as const;

const PublishedTime = ({ timestamp }: { timestamp: number }) => {
  const { t } = useTranslation();
  return (
    <Flex gap={1} className="oui-font-normal">
      <Text size="xs" intensity={54}>
        {t("notification.publishedOn")}
      </Text>
      <Text.formatted
        size="xs"
        intensity={54}
        rule="date"
        formatString="MMM dd, yyyy · HH:mm"
      >
        {timestamp}
      </Text.formatted>
    </Flex>
  );
};

export const AnnouncementPageUI = (props: AnnouncementCenterScriptReturns) => {
  const { t } = useTranslation();
  const {
    article,
    announcementId,
    category,
    announcements,
    selectCategory,
    openArticle,
    backToList,
  } = props;

  const readState =
    props.status === "loading" ? (
      <div
        role="status"
        aria-label={t("notification.loading")}
        className="oui-space-y-6 oui-py-6"
      >
        {Array.from({ length: announcementId ? 4 : 5 }, (_, index) => (
          <div
            key={index}
            className="oui-h-16 oui-animate-pulse oui-rounded-md oui-bg-base-8"
          />
        ))}
      </div>
    ) : props.status === "error" ? (
      <Flex
        direction="column"
        gap={4}
        itemAlign="start"
        className="oui-py-6"
        role="alert"
      >
        <Text size="sm" intensity={54}>
          {t("notification.loadFailed")}
        </Text>
        <Button
          variant="contained"
          color="primary"
          size="lg"
          onClick={props.retry}
        >
          {t("notification.retry")}
        </Button>
      </Flex>
    ) : null;

  if (announcementId) {
    return (
      <main className="oui-announcement-detail oui-mx-auto oui-w-full oui-max-w-4xl oui-px-5 oui-py-8 lg:oui-px-8 lg:oui-py-12">
        <Flex gap={2} itemAlign="center" className="oui-mb-8 oui-flex-wrap">
          <Button
            variant="text"
            size="sm"
            color="secondary"
            className="oui-px-0 oui-text-base-contrast-54"
            onClick={() => backToList("all")}
          >
            {t("notification.announcements")}
          </Button>
          {article && (
            <>
              <ChevronRightIcon
                size={14}
                className="oui-text-base-contrast-36"
              />
              <Button
                variant="text"
                size="sm"
                color="secondary"
                className="oui-px-0 oui-text-base-contrast-54"
                onClick={() => backToList(article.category)}
              >
                {t(categoryKeys[article.category])}
              </Button>
            </>
          )}
          <ChevronRightIcon size={14} className="oui-text-base-contrast-36" />
          <Text size="xs" intensity={80}>
            {t("notification.article")}
          </Text>
        </Flex>
        {readState ??
          (article ? (
            <article>
              <div className="oui-mb-4">
                <AnnouncementSourceBadge
                  isOfficial={article.is_official}
                  platformName={props.platformName}
                />
              </div>
              <Text
                asChild
                size="3xl"
                weight="bold"
                intensity={98}
                className="oui-leading-tight"
              >
                <h1>{article.title}</h1>
              </Text>
              <div className="oui-mb-8 oui-mt-4">
                <PublishedTime timestamp={article.published_time} />
              </div>
              <Divider intensity={6} />
              <div className="oui-mt-8 oui-space-y-8">
                <AnnouncementMarkdown content={article.content} />
              </div>
            </article>
          ) : (
            <Flex direction="column" gap={4} itemAlign="start">
              <Text size="xl" weight="semibold">
                {t("notification.notFound")}
              </Text>
              <Text size="sm" weight="regular" intensity={54}>
                {t("notification.notFoundDescription")}
              </Text>
            </Flex>
          ))}
      </main>
    );
  }

  return (
    <main className="oui-announcement-center oui-mx-auto oui-w-full oui-max-w-6xl oui-px-5 oui-py-8 lg:oui-px-8 lg:oui-py-12">
      <Text asChild size="3xl" weight="bold" intensity={98}>
        <h1>{t("notification.announcements")}</h1>
      </Text>
      <div className="oui-mt-8 oui-flex oui-flex-col lg:oui-flex-row">
        <nav
          aria-label={t("notification.announcements")}
          className="oui-announcement-categories oui-hide-scrollbar oui-flex oui-gap-2 oui-overflow-x-auto oui-py-4 lg:oui-w-52 lg:oui-shrink-0 lg:oui-flex-col lg:oui-py-6 lg:oui-pe-6"
        >
          {announcementCategories.map((item) => (
            <Button
              key={item}
              variant="text"
              color="secondary"
              size="lg"
              aria-current={category === item ? "page" : undefined}
              onClick={() => selectCategory(item)}
              className={cn(
                "oui-text-sm oui-shrink-0 oui-justify-start hover:oui-bg-base-6",
                category === item
                  ? "oui-bg-base-6 oui-text-primary"
                  : "oui-text-base-contrast-54",
              )}
            >
              {t(categoryKeys[item])}
            </Button>
          ))}
        </nav>
        <div className="oui-announcement-list oui-min-w-0 oui-flex-1 lg:oui-ps-8">
          {readState ??
            (announcements.length ? (
              <ul className="oui-divide-y oui-divide-line-6">
                {announcements.map((item) => (
                  <li key={item.announcement_id}>
                    <button
                      type="button"
                      onClick={() => openArticle(item.announcement_id)}
                      className="oui-announcement-list-item oui-flex oui-w-full oui-flex-col oui-gap-3 oui-rounded-md oui-px-3 oui-py-6 oui-text-start hover:oui-bg-base-9 focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
                    >
                      <AnnouncementSourceBadge
                        isOfficial={item.is_official}
                        platformName={props.platformName}
                        className="oui-self-start"
                      />
                      <Text size="base" weight="semibold" intensity={98}>
                        {item.title}
                      </Text>
                      <PublishedTime timestamp={item.published_time} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="oui-flex oui-h-48 oui-items-center oui-justify-center">
                <InjectableEmptyDataState title={t("notification.empty")} />
              </div>
            ))}
          {props.status === "ready" && props.pageTotal > 1 && (
            <nav
              aria-label={t("notification.pagination")}
              className="oui-mt-6 oui-flex oui-justify-end"
            >
              <PaginationItems
                page={props.page}
                pageTotal={props.pageTotal}
                pageSize={20}
                count={props.count}
                onPageChange={props.selectPage}
              />
            </nav>
          )}
        </div>
      </div>
    </main>
  );
};
