import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Column,
  Text,
  Flex,
  ListView,
  Divider,
  useScreen,
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { RefereeDataType } from "../../../../../hooks/useMultiLevelReferees";
import { ReferralCodeFormType } from "../../../../../types";
import { formatYMDTime } from "../../../../../utils/utils";
import {
  AddressCell,
  BreakdownCell,
  TooltipCell,
  MobileCell,
  MobileCard,
} from "../base/cells";
import { RefereesTableScriptReturns } from "./refereesTable.script";

type RefereesTableUIProps = RefereesTableScriptReturns;

const getRebateRateText = (rate: number) => {
  return (rate * 100).toFixed(0) + "%";
};

const getRefereeType = (bindType: string) => {
  const { t } = useTranslation();
  if (bindType === "legacy") {
    return {
      text: t("affiliate.singleLevelLegacy"),
      tooltip: t("affiliate.singleLevelLegacy.tooltip"),
    };
  }

  return {
    text: t("affiliate.multiLevel"),
    tooltip: t("affiliate.multiLevel.tooltip"),
  };
};

const MobileRefereeItem: FC<{
  item: RefereeDataType;
  onEditReferee: RefereesTableScriptReturns["onEditReferee"];
}> = ({ item, onEditReferee }) => {
  const { t } = useTranslation();
  const typeInfo = getRefereeType(item.bind_type);
  return (
    <MobileCard>
      <MobileCell label={t("common.address")}>
        <AddressCell address={item.address} title={t("common.address")} />
      </MobileCell>
      <MobileCell label={t("common.type")}>
        <TooltipCell
          text={typeInfo.text}
          tooltip={typeInfo.tooltip}
          title={t("common.type")}
        />
      </MobileCell>
      <MobileCell label={t("affiliate.boundAt")} align="end">
        <Text size="sm">{formatYMDTime(item.code_binding_time)}</Text>
      </MobileCell>
      <MobileCell label={t("affiliate.referralCodes")}>
        <Text size="sm">{item.bind_code}</Text>
      </MobileCell>

      <MobileCell label={t("affiliate.referralCodes.column.you&Referee")}>
        <Text size="sm">
          {getRebateRateText(item.referral_rebate_rate) + "/"}
          <span className="oui-text-base-contrast-54">
            {getRebateRateText(item.referee_rebate_rate)}{" "}
          </span>
          {!item.is_default_rate && (
            <span className="oui-text-primary-light">
              {`(${t("affiliate.customized")})`}
            </span>
          )}
        </Text>
      </MobileCell>
      <MobileCell label={t("affiliate.networkSize")} align="end">
        <BreakdownCell
          total={item.network_size}
          direct={item.direct_invites}
          indirect={item.indirect_invites}
          title={t("affiliate.networkSize")}
        />
      </MobileCell>
      <MobileCell label={t("common.volume")}>
        <BreakdownCell
          total={item.volume}
          direct={item.direct_volume}
          indirect={item.indirect_volume}
          prefix="$"
          fix={2}
          title={t("common.volume")}
        />
      </MobileCell>

      <MobileCell label={t("affiliate.commission")}>
        <BreakdownCell
          total={item.commission}
          direct={item.direct_rebate}
          indirect={item.indirect_rebate}
          directBonus={item.direct_bonus_rebate}
          prefix="$"
          fix={6}
          title={t("affiliate.commission")}
        />
      </MobileCell>
      <MobileCell
        label={t("common.action")}
        align="end"
        className="oui-col-start-3"
      >
        {item.bind_type !== "legacy" && (
          <Flex gap={2}>
            <Text
              className="oui-cursor-pointer oui-text-primary-light"
              onClick={() => onEditReferee(ReferralCodeFormType.Edit, item)}
            >
              {t("common.edit")}
            </Text>
            {!item.is_default_rate && (
              <Text
                className="oui-cursor-pointer oui-text-primary-light"
                onClick={() => onEditReferee(ReferralCodeFormType.Reset, item)}
              >
                {t("common.reset")}
              </Text>
            )}
          </Flex>
        )}
      </MobileCell>
    </MobileCard>
  );
};

export const RefereesTableUI: FC<RefereesTableUIProps> = (props) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const showPagination = (props.refereesPagination?.count ?? 0) >= 10;

  const refereeColumns = useMemo<Column<RefereeDataType>[]>(() => {
    return [
      {
        title: t("common.address"),
        dataIndex: "address",
        render: (value: string) => (
          <AddressCell address={value} title={t("common.address")} />
        ),
      },
      {
        title: t("common.type"),
        dataIndex: "bind_type",
        render: (_: unknown, record: RefereeDataType) => {
          const typeInfo = getRefereeType(record.bind_type);
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
        title: t("affiliate.boundAt"),
        dataIndex: "code_binding_time",
        render: (value: number) => <Text>{formatYMDTime(value)}</Text>,
      },
      {
        title: t("affiliate.referralCodes"),
        dataIndex: "bind_code",
        render: (value: string) => <Text>{value}</Text>,
      },
      {
        title: t("affiliate.referralCodes.column.you&Referee"),
        dataIndex: "referee_rebate_rate",
        render: (_: unknown, record: RefereeDataType) => (
          <Text>
            {getRebateRateText(record.referral_rebate_rate) + "/"}
            <span className="oui-text-base-contrast-54">
              {getRebateRateText(record.referee_rebate_rate)}{" "}
            </span>
            {!record.is_default_rate && (
              <span className="oui-text-primary-light">
                {`(${t("affiliate.customized")})`}
              </span>
            )}
          </Text>
        ),
        onSort: true,
      },
      {
        title: t("affiliate.networkSize"),
        dataIndex: "network_size",
        render: (_: number, record: RefereeDataType) => (
          <BreakdownCell
            total={record.network_size}
            direct={record.direct_invites}
            indirect={record.indirect_invites}
            title={t("affiliate.networkSize")}
          />
        ),
        onSort: true,
      },
      {
        title: t("common.volume"),
        dataIndex: "volume",
        render: (_: number, record: RefereeDataType) => (
          <BreakdownCell
            total={record.volume}
            direct={record.direct_volume}
            indirect={record.indirect_volume}
            prefix="$"
            fix={2}
            title={t("common.volume")}
          />
        ),
        onSort: true,
      },
      {
        title: t("affiliate.commission"),
        dataIndex: "commission",
        render: (_: number, record: RefereeDataType) => (
          <BreakdownCell
            total={record.commission}
            direct={record.direct_rebate}
            indirect={record.indirect_rebate}
            directBonus={record.direct_bonus_rebate}
            prefix="$"
            fix={6}
            title={t("affiliate.commission")}
          />
        ),
        onSort: true,
      },
      {
        title: t("common.action"),
        dataIndex: "action",
        render: (_: unknown, record: RefereeDataType) =>
          record.bind_type !== "legacy" ? (
            <>
              <Text
                className="oui-cursor-pointer oui-text-primary-light"
                onClick={() =>
                  props.onEditReferee(ReferralCodeFormType.Edit, record)
                }
              >
                {t("common.edit")}
              </Text>
              {!record.is_default_rate && (
                <Text
                  className="oui-ml-2 oui-cursor-pointer oui-text-primary-light"
                  onClick={() =>
                    props.onEditReferee(ReferralCodeFormType.Reset, record)
                  }
                >
                  {t("common.reset")}
                </Text>
              )}
            </>
          ) : null,
      },
    ];
  }, [t, props.onEditReferee]);

  return (
    <>
      {isMobile ? (
        <div className="oui-flex oui-flex-col oui-px-4">
          <ListView
            dataSource={props.refereesData}
            contentClassName="!oui-space-y-0 oui-pb-3"
            renderItem={(item, index) => (
              <div key={index}>
                <MobileRefereeItem
                  item={item}
                  onEditReferee={props.onEditReferee}
                />
                <Divider intensity={8} />
              </div>
            )}
          />
        </div>
      ) : (
        <div className={`oui-px-3 ${showPagination ? "" : "oui-pb-3"}`}>
          <AuthGuardDataTable
            bordered
            columns={refereeColumns}
            dataSource={props.refereesData}
            loading={props.isRefereesLoading}
            pagination={showPagination ? props.refereesPagination : undefined}
            onSort={props.onRefereesSort}
            onRow={() => ({ className: "oui-h-12" })}
            className="[&_.oui-h-10.oui-w-full]:!oui-mx-0 [&_.oui-table-pagination]:!oui-justify-end [&_th]:!oui-tracking-[0.03em] [&_th]:!oui-px-3 [&_td]:!oui-px-3"
          />
        </div>
      )}
    </>
  );
};
