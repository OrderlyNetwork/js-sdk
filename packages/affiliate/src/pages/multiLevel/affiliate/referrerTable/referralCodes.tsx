import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Column, Text, Grid, ListView, Divider } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { Decimal } from "@orderly.network/utils";
import {
  useReferralCodesScript,
  ReferralCodeType,
} from "../../../affiliate/referralCodes/referralCodes.script";
import { MobileCell, MobileCard, TooltipCell, BreakdownCell } from "./cells";

const getReferralCodeType = (referralType?: "single" | "multi") => {
  const { t } = useTranslation();
  if (referralType === "multi") {
    return {
      text: t("affiliate.refereeType.multiLevel"),
      tooltip: t("affiliate.refereeType.multiLevel.tooltip"),
    };
  }

  return {
    text: t("affiliate.refereeType.singleLevelLegacy"),
    tooltip: t("affiliate.refereeType.singleLevelLegacy.tooltip"),
  };
};

const MobileReferralCodeItem: FC<{
  item: ReferralCodeType;
  copyCode: (code: string) => void;
}> = ({ item, copyCode }) => {
  const { t } = useTranslation();
  const referrerRate = new Decimal(item.referrer_rebate_rate ?? 0)
    .mul(100)
    .toFixed(0);
  const refereeRate = new Decimal(item.referee_rebate_rate ?? 0)
    .mul(100)
    .toFixed(0);
  const typeInfo = getReferralCodeType(item.referral_type);
  const isMultiLevel = item.referral_type === "multi";
  const stats = item.multi_level_statistics;

  return (
    <MobileCard>
      <MobileCell label={t("affiliate.referralCode")}>
        <Text>{item.code || ""}</Text>
      </MobileCell>
      <MobileCell label={t("common.type")}>
        <TooltipCell
          text={typeInfo.text}
          tooltip={typeInfo.tooltip}
          title={t("common.type")}
        />
      </MobileCell>
      <MobileCell
        label={t("affiliate.referralCodes.column.you&Referee")}
        align="end"
      >
        <Text>
          {referrerRate}%/
          <span className="oui-text-base-contrast-54">{refereeRate}%</span>
        </Text>
      </MobileCell>
      <MobileCell label={t("affiliate.networkSize")}>
        <BreakdownCell
          total={item.total_invites ?? 0}
          direct={
            isMultiLevel
              ? (stats?.direct_invites ?? 0)
              : (item.total_invites ?? 0)
          }
          indirect={isMultiLevel ? (stats?.indirect_invites ?? 0) : 0}
          title={t("affiliate.networkSize")}
        />
      </MobileCell>
      <MobileCell label={t("common.volume")}>
        <BreakdownCell
          total={item.total_volume ?? 0}
          direct={
            isMultiLevel
              ? (stats?.direct_volume ?? 0)
              : (item.total_volume ?? 0)
          }
          indirect={isMultiLevel ? (stats?.indirect_volume ?? 0) : 0}
          prefix="$"
          fix={2}
          title={t("common.volume")}
        />
      </MobileCell>
      <MobileCell label={t("affiliate.commission")} align="end">
        <BreakdownCell
          total={item.total_rebate ?? 0}
          direct={
            isMultiLevel
              ? (stats?.direct_rebate ?? 0)
              : (item.total_rebate ?? 0)
          }
          indirect={isMultiLevel ? (stats?.indirect_rebate ?? 0) : 0}
          prefix="$"
          fix={6}
          title={t("affiliate.commission")}
        />
      </MobileCell>

      <MobileCell label={t("common.action")}>
        <Text
          className="oui-cursor-pointer oui-text-primary-light"
          onClick={(e) => {
            e.stopPropagation();
            copyCode(item.code);
          }}
        >
          {t("common.copy")}
        </Text>
      </MobileCell>
    </MobileCard>
  );
};

export const ReferralCodesTable: FC = () => {
  const { t } = useTranslation();
  const { codes, copyCode } = useReferralCodesScript();

  const columns = useMemo<Column<ReferralCodeType>[]>(() => {
    return [
      {
        title: t("affiliate.referralCode"),
        dataIndex: "code",
        render: (value: string) => <Text>{value || ""}</Text>,
      },
      {
        title: t("common.type"),
        dataIndex: "referral_type",
        render: (_: unknown, record: ReferralCodeType) => {
          const typeInfo = getReferralCodeType(record.referral_type);
          return (
            <TooltipCell
              text={typeInfo.text}
              tooltip={typeInfo.tooltip}
              title={t("common.type")}
            />
          );
        },
      },
      {
        title: t("affiliate.referralCodes.column.you&Referee"),
        dataIndex: "rate",
        render: (_: unknown, record: ReferralCodeType) => {
          const referrerRate = new Decimal(record.referrer_rebate_rate ?? 0)
            .mul(100)
            .toFixed(0);
          const refereeRate = new Decimal(record.referee_rebate_rate ?? 0)
            .mul(100)
            .toFixed(0);
          return (
            <Text>
              {referrerRate}%
              <span className="oui-text-base-contrast-54">/{refereeRate}%</span>
            </Text>
          );
        },
      },
      {
        title: t("affiliate.networkSize"),
        dataIndex: "total_invites",
        render: (_: unknown, record: ReferralCodeType) => {
          const isMultiLevel = record.referral_type === "multi";
          const stats = record.multi_level_statistics;
          return (
            <BreakdownCell
              total={record.total_invites ?? 0}
              direct={
                isMultiLevel
                  ? (stats?.direct_invites ?? 0)
                  : (record.total_invites ?? 0)
              }
              indirect={isMultiLevel ? (stats?.indirect_invites ?? 0) : 0}
              title={t("affiliate.networkSize")}
            />
          );
        },
      },
      {
        title: t("common.volume"),
        dataIndex: "total_volume",
        render: (_: unknown, record: ReferralCodeType) => {
          const isMultiLevel = record.referral_type === "multi";
          const stats = record.multi_level_statistics;
          return (
            <BreakdownCell
              total={record.total_volume ?? 0}
              direct={
                isMultiLevel
                  ? (stats?.direct_volume ?? 0)
                  : (record.total_volume ?? 0)
              }
              indirect={isMultiLevel ? (stats?.indirect_volume ?? 0) : 0}
              prefix="$"
              fix={2}
              title={t("common.volume")}
            />
          );
        },
      },
      {
        title: t("affiliate.commission"),
        dataIndex: "total_rebate",
        render: (_: unknown, record: ReferralCodeType) => {
          const isMultiLevel = record.referral_type === "multi";
          const stats = record.multi_level_statistics;
          return (
            <BreakdownCell
              total={record.total_rebate ?? 0}
              direct={
                isMultiLevel
                  ? (stats?.direct_rebate ?? 0)
                  : (record.total_rebate ?? 0)
              }
              indirect={isMultiLevel ? (stats?.indirect_rebate ?? 0) : 0}
              prefix="$"
              fix={6}
              title={t("affiliate.commission")}
            />
          );
        },
      },
      {
        title: t("common.action"),
        dataIndex: "action",
        render: (_: unknown, record: ReferralCodeType) => (
          <Text
            className="oui-cursor-pointer oui-text-primary-light"
            onClick={(e) => {
              e.stopPropagation();
              copyCode(record.code);
            }}
          >
            {t("common.copy")}
          </Text>
        ),
      },
    ];
  }, [t, copyCode]);

  return (
    <div className="md:oui-px-3">
      <div className="oui-hidden md:oui-block">
        <AuthGuardDataTable
          bordered
          columns={columns}
          dataSource={codes}
          loading={!codes}
          onRow={() => ({ className: "oui-h-12" })}
          className="[&_.oui-h-10.oui-w-full]:!oui-mx-0 [&_.oui-table-pagination]:!oui-justify-end [&_th]:!oui-tracking-[0.03em] [&_th]:!oui-px-3 [&_td]:!oui-px-3"
        />
      </div>
      <div className="oui-flex oui-flex-col oui-px-4 md:oui-hidden">
        <ListView
          dataSource={codes}
          contentClassName="!oui-space-y-0"
          renderItem={(item, index) => (
            <div key={index}>
              <MobileReferralCodeItem item={item} copyCode={copyCode} />
              {index < (codes?.length || 0) - 1 && <Divider intensity={8} />}
            </div>
          )}
        />
      </div>
    </div>
  );
};
