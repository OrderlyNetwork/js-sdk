import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  ChevronRightIcon,
  Divider,
  Flex,
  InjectableEmptyDataState,
  Text,
  Tabs,
  TabPanel,
  PaginationItems,
  cn,
} from "@orderly.network/ui";
import { AnnouncementMarkdown } from "../articles/markdown";
import { announcementCategories } from "../articles/types";
import { AnnouncementDetailSkeleton } from "../components/announcementDetailSkeleton";
import { AnnouncementListSkeleton } from "../components/announcementListSkeleton";
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

/**
 * Controlled announcement page presentation using AnnouncementCenterScriptReturns.
 * The host supplies list/detail data, read status, filters, pagination and callbacks.
 * Does not start reads or navigate on its own; source badges and filters default to true.
 * @returns A list, detail, loading, error or unavailable-article view for the supplied state.
 */
export const AnnouncementPageUI = (props: AnnouncementCenterScriptReturns) => {
  const { t } = useTranslation();
  const {
    article,
    isDetail,
    category,
    announcements,
    selectCategory,
    sourceFilter,
    selectSource,
    openArticle,
    backToList,
    showSourceBadge = true,
    showSourceFilter = true,
  } = props;

  const readState =
    props.status === "loading" ? (
      <div role="status" aria-label={t("notification.loading")}>
        {isDetail ? (
          <AnnouncementDetailSkeleton />
        ) : (
          <AnnouncementListSkeleton showSourceBadge={showSourceBadge} />
        )}
      </div>
    ) : props.status === "error" ? (
      <div
        className="oui-announcement-error oui-flex oui-min-h-[280px] oui-flex-col oui-items-center oui-justify-center oui-gap-4 oui-px-5 oui-py-8 oui-text-center lg:oui-min-h-[360px]"
        role="alert"
      >
        <Text
          as="p"
          size="sm"
          intensity={54}
          className="oui-max-w-[360px] oui-break-words oui-whitespace-normal oui-leading-6"
        >
          {t("notification.loadFailed")}
        </Text>
        <Button
          variant="contained"
          color="primary"
          size="md"
          className="oui-shrink-0 oui-px-5"
          onClick={props.retry}
        >
          {t("notification.retry")}
        </Button>
      </div>
    ) : null;

  if (isDetail) {
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
              {showSourceBadge && (
                <div className="oui-mb-4">
                  <AnnouncementSourceBadge
                    isOfficial={article.is_official}
                    platformName={props.platformName}
                  />
                </div>
              )}
              <Text
                asChild
                size="3xl"
                weight="bold"
                intensity={98}
                className="oui-break-words oui-leading-tight"
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

  const listContent = (
    <>
      {readState ??
        (announcements.length ? (
          <ul className="oui-divide-y oui-divide-line-6">
            {announcements.map((item) => (
              <li key={item.announcement_id}>
                <button
                  type="button"
                  onClick={() => openArticle(item.announcement_id)}
                  className="oui-announcement-list-item -oui-mx-3 oui-flex oui-w-[calc(100%+24px)] oui-flex-col oui-gap-3 oui-rounded-md oui-px-3 oui-py-4 oui-text-start hover:oui-bg-base-9 lg:oui-mx-0 lg:oui-w-full lg:oui-py-6 focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
                >
                  {showSourceBadge && (
                    <AnnouncementSourceBadge
                      isOfficial={item.is_official}
                      platformName={props.platformName}
                      className="oui-self-start"
                    />
                  )}
                  <Text
                    size="base"
                    weight="semibold"
                    intensity={98}
                    className="oui-min-w-0 oui-max-w-full oui-break-words"
                  >
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
    </>
  );

  return (
    <main className="oui-announcement-center oui-mx-auto oui-w-full oui-max-w-6xl oui-px-5 oui-py-8 lg:oui-px-8 lg:oui-py-12">
      <Text asChild size="3xl" weight="bold" intensity={98}>
        <h1 className="oui-announcement-title">
          {t("notification.announcements")}
        </h1>
      </Text>
      <div className="oui-announcement-navigation oui-mt-6 oui-flex oui-flex-col lg:oui-mt-8 lg:oui-flex-row">
        <aside className="oui-announcement-filters lg:oui-w-60 lg:oui-shrink-0 lg:oui-pe-6">
          <nav
            aria-label={t("notification.announcements")}
            className="oui-announcement-categories oui-hide-scrollbar oui-flex oui-gap-2 oui-overflow-x-auto oui-py-0 lg:oui-flex-col lg:oui-py-6"
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
        </aside>
        <div className="oui-announcement-list oui-min-w-0 oui-flex-1 lg:oui-ps-8">
          {showSourceFilter ? (
            <Tabs
              value={sourceFilter}
              onValueChange={(value) => {
                if (
                  value === "all" ||
                  value === "official" ||
                  value === "community"
                )
                  selectSource(value);
              }}
              variant="contained"
              size="lg"
              aria-label={t("notification.source.filter")}
              classNames={{
                tabsList:
                  "oui-announcement-sources oui-mb-4 oui-mt-4 oui-flex oui-min-h-8 oui-flex-wrap oui-items-center oui-gap-1 oui-px-0 lg:oui-mb-4 lg:oui-mt-6 lg:oui-min-h-10 lg:oui-px-3",
                trigger:
                  "oui-box-border oui-h-auto oui-min-h-8 oui-min-w-[72px] oui-max-w-full oui-whitespace-normal oui-break-words oui-py-1",
              }}
            >
              {(["all", "community", "official"] as const).map((item) => (
                <TabPanel
                  key={item}
                  value={item}
                  title={
                    {
                      all: t("common.all"),
                      official: t("notification.source.system"),
                      community:
                        props.platformName?.trim() ||
                        t("notification.source.platform"),
                    }[item]
                  }
                >
                  {/* Update all panels together to preserve tab registration order. */}
                  {listContent}
                </TabPanel>
              ))}
            </Tabs>
          ) : (
            listContent
          )}
        </div>
      </div>
    </main>
  );
};
