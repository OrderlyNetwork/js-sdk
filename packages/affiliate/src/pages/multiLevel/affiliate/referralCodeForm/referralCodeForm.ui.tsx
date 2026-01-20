import { ReactNode, useRef } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Button,
  Flex,
  inputFormatter,
  Slider,
  Text,
  TextField,
  WarningIcon,
  Divider,
  formatAddress,
} from "@orderly.network/ui";
import { ReferralCodeFormField, ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormReturns } from "./referralCodeForm.script";
import { ReferralCodeFormWidgetProps } from "./referralCodeForm.widget";

export type ReferralCodeFormProps = ReferralCodeFormReturns &
  ReferralCodeFormWidgetProps;

export const ReferralCodeForm = (props: ReferralCodeFormProps) => {
  const { isReview } = props;
  const { t } = useTranslation();

  const isCreate = props.type === ReferralCodeFormType.Create;
  const isEdit = props.type === ReferralCodeFormType.Edit;
  const isReset = props.type === ReferralCodeFormType.Reset;

  const editAccountIdRebateRate = !!props.accountId;

  const showReferralCodeInput = isEdit && !editAccountIdRebateRate;

  const noCommissionAvailable = props.maxRebateRate === 0;

  const renderTitle = () => {
    if (isCreate) {
      return t("affiliate.referralCodes.create.modal.title");
    }

    if (isReset) {
      return t("affiliate.resetRebateRate.modal.title");
    }

    if (isEdit) {
      if (editAccountIdRebateRate) {
        return t("affiliate.refereeRebateRate.modal.title", {
          accountId: formatAddress(props.accountId!),
        });
      }

      return t("affiliate.referralCodes.edit.modal.title");
    }
  };

  const renderButtonText = () => {
    if (isCreate) {
      return t("affiliate.confirmAndGenerate");
    }

    if (isReset) {
      return t("common.reset");
    }

    if (isReview) {
      return t("affiliate.saveChanges");
    }

    return t("affiliate.review");
  };

  const renderWarning = () => {
    if (isCreate) {
      return t("affiliate.multiLevel.referralCode.create.warning");
    }

    if (isReset) {
      return (
        <Text size="2xs" intensity={54}>
          {t("affiliate.resetRebateRate.modal.description", {
            accountId: formatAddress(props.accountId!),
          })}
        </Text>
      );
    }

    if (isEdit) {
      if (editAccountIdRebateRate) {
        return (
          <WarningBox description={t("affiliate.refereeRebateRate.warning")} />
        );
      }

      return (
        <WarningBox
          description={
            isReview
              ? t("affiliate.review.warning")
              : t("affiliate.referralCode.edit.warning")
          }
        />
      );
    }
  };

  const title = (
    <Flex width={"100%"} direction="column" itemAlign="start" gap={3}>
      <Text size="base" intensity={98}>
        {renderTitle()}
      </Text>
      <Divider intensity={8} className="oui-w-full" />
    </Flex>
  );

  const autoFocus = props.focusField === ReferralCodeFormField.ReferralCode;
  const hasSetCursorToEnd = useRef(false);

  const referralCodeInput = showReferralCodeInput && !isReset && (
    <TextField
      type="text"
      placeholder=""
      fullWidth
      label={t("affiliate.referralCode.editCodeModal.label")}
      onClean={() => {
        props.setNewCode("");
      }}
      value={props.newCode}
      onChange={(e) => {
        const _value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        props.setNewCode(_value);
      }}
      onFocus={(e) => {
        if (autoFocus && !hasSetCursorToEnd.current) {
          hasSetCursorToEnd.current = true;
          const input = e.target as HTMLInputElement;
          const len = input.value.length;
          requestAnimationFrame(() => {
            input.setSelectionRange(len, len);
          });
        }
      }}
      formatters={[
        inputFormatter.createRegexInputFormatter((value: string | number) => {
          return String(value).replace(/[a-z]/g, (char: string) =>
            char.toUpperCase(),
          );
        }),
        inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g),
      ]}
      className="oui-w-full"
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
        input: "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
      }}
      maxLength={10}
      minLength={4}
      autoComplete="off"
      disabled={isReview}
      autoFocus={autoFocus}
    />
  );

  const commissionConfiguration = !isReset && (
    <>
      <Text size="2xs" intensity={54}>
        {t("affiliate.commissionConfiguration")}
      </Text>

      {!isReview && (
        <Text size="2xs" intensity={54}>
          {t("affiliate.totalCommissionAvailable")}:{" "}
          <Text className="oui-text-warning">{props.maxRebatePercentage}%</Text>
        </Text>
      )}
    </>
  );

  const slider = !noCommissionAvailable && !isReview && !isReset && (
    <Box width={"100%"} my={2}>
      <Slider
        min={0}
        max={props.maxRebatePercentage}
        step={1}
        value={[props.referrerRebatePercentage]}
        onValueChange={(value) => {
          props.setReferrerRebatePercentage(value[0] as number);
        }}
        classNames={{
          range: "oui-bg-success-darken oui-h-2 oui-top-[0px]",
          trackInner: "oui-bg-success-darken/30 oui-h-2 oui-top-[0px]",
          thumb: "oui-border-[#d9d9d9] oui-bg-[#d9d9d9] oui-size-4",
        }}
      />
    </Box>
  );

  const refereeInfo = editAccountIdRebateRate && !isReset && (
    <Flex width={"100%"} justify="between" gap={2}>
      <Text size="2xs" intensity={54}>
        {t("affiliate.referees")}
      </Text>

      <Text.formatted rule="address" size="2xs" intensity={98}>
        {props.accountId}
      </Text.formatted>
    </Flex>
  );

  const noCommissionAvailableWarning = noCommissionAvailable && (
    <Text size="2xs" className="oui-text-warning">
      {t("affiliate.noCommissionAvailable")}
    </Text>
  );

  const resetRebateRateLabel = isReset && (
    <Text size="2xs" intensity={98}>
      {t("affiliate.resetRebateRate.rateAfterReset")}
    </Text>
  );

  const rebateRateInfo = (
    <div className="oui-w-full">
      <Flex justify={"between"} width={"100%"}>
        <Text size="sm" intensity={54}>
          {t("affiliate.youKeep")}
        </Text>
        <Text size="sm" intensity={54}>
          {t("affiliate.inviteesGet")}
        </Text>
      </Flex>

      <Flex justify={"between"} width={"100%"}>
        <Text.formatted size="lg" className="oui-text-success-darken">
          {props.referrerRebatePercentage}%
        </Text.formatted>
        <Text.formatted size="lg" className="oui-text-success-darken/50">
          {props.refereeRebatePercentage}%
        </Text.formatted>
      </Flex>
    </div>
  );

  const buttons = (
    <Flex direction={"row"} gap={2} width={"100%"} mt={0} pt={5}>
      <Button
        variant="contained"
        color="gray"
        fullWidth
        onClick={props.close}
        data-testid="oui-testid-leverage-cancel-btn"
        size="md"
      >
        {t("common.cancel")}
      </Button>
      <Button
        fullWidth
        onClick={props.onClick}
        data-testid="oui-testid-leverage-save-btn"
        disabled={props.disabled || props.isMutating}
        loading={props.isMutating}
        size="md"
      >
        {renderButtonText()}
      </Button>
    </Flex>
  );

  return (
    <Flex
      direction="column"
      itemAlign="start"
      gap={6}
      className="oui-font-semibold"
    >
      {title}
      {renderWarning()}

      {referralCodeInput}
      {refereeInfo}

      <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
        {commissionConfiguration}
        {slider}
        {resetRebateRateLabel}
        {rebateRateInfo}
        {noCommissionAvailableWarning}
        {buttons}
      </Flex>
    </Flex>
  );
};

const WarningBox = (props: { description: ReactNode }) => {
  return (
    <Flex
      className="oui-bg-warning/10"
      justify="start"
      itemAlign="start"
      gap={1}
      r="lg"
      p={3}
    >
      <WarningIcon className="oui-shrink-0 oui-text-warning" />
      <Text size="2xs" intensity={54} className="oui-text-warning">
        {props.description}
      </Text>
    </Flex>
  );
};
