import { ReactNode, useMemo, useRef, useState } from "react";
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
  const { type, isReview } = props;
  const { t } = useTranslation();

  const isReset = type === ReferralCodeFormType.Reset;
  const hasBoundReferee = !!props.directInvites && props.directInvites > 0;

  const isEditingRefereeRebateRate = !!props.accountId;

  const noCommissionAvailable = props.maxRebateRate === 0;

  const { title, description, buttonText } = useMemo(() => {
    switch (type) {
      case ReferralCodeFormType.Create:
        return {
          title: t("affiliate.referralCode.create.modal.title"),
          description: t("affiliate.referralCode.create.warning"),
          buttonText: t("affiliate.confirmAndGenerate"),
        };
      case ReferralCodeFormType.Edit:
        return {
          title: isEditingRefereeRebateRate
            ? t("affiliate.refereeRebateRate.modal.title", {
                accountId: formatAddress(props.accountId!),
              })
            : t("affiliate.referralCode.edit.modal.title"),
          description: isEditingRefereeRebateRate
            ? isReview
              ? t("affiliate.refereeRebateRate.review.warning")
              : t("affiliate.refereeRebateRate.edit.warning")
            : isReview
              ? t("affiliate.rebateRate.review.warning")
              : t("affiliate.rebateRate.edit.warning"),
          buttonText: isReview
            ? t("affiliate.saveChanges")
            : t("affiliate.review"),
        };
      case ReferralCodeFormType.Reset:
        return {
          title: t("affiliate.resetRebateRate.modal.title"),
          description: (
            <Text size="2xs" intensity={54}>
              {t("affiliate.resetRebateRate.modal.description", {
                accountId: formatAddress(props.accountId!),
              })}
            </Text>
          ),
          buttonText: t("common.reset"),
        };
      default:
        return {
          title: "",
          description: "",
          buttonText: "",
        };
    }
  }, [t, type, isEditingRefereeRebateRate, isReview, props.accountId]);

  const titleView = (
    <Flex width={"100%"} direction="column" itemAlign="start" gap={3}>
      <Text size="base" intensity={98}>
        {title}
      </Text>
      <Divider intensity={8} className="oui-w-full" />
    </Flex>
  );

  const descriptionView = <WarningBox>{description}</WarningBox>;

  const referralCodeInput = (
    <ReferralCodeInput
      value={props.newCode}
      onChange={props.setNewCode}
      autoFocus={props.focusField === ReferralCodeFormField.ReferralCode}
      disabled={isReview || hasBoundReferee}
    />
  );

  const commissionConfiguration = (
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

  const rebateRateSlider = (
    <RebateRateSlider
      value={props.referrerRebatePercentage}
      restValue={props.refereeRebatePercentage}
      onChange={props.setReferrerRebatePercentage}
      max={props.maxRebatePercentage}
      disabled={noCommissionAvailable || isReview || isReset}
      disabledIncrease={hasBoundReferee}
    />
  );

  const refereeInfo = (
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
      {isEditingRefereeRebateRate
        ? t("affiliate.rebateRate.noCommissionRate")
        : t("affiliate.rebateRate.noCommissionAvailable")}
    </Text>
  );

  const resetRebateRateLabel = (
    <Text size="2xs" intensity={98} className="oui-text-start">
      {t("affiliate.resetRebateRate.rateAfterReset")}:
    </Text>
  );

  const buttons = (
    <Flex direction={"row"} gap={2} width={"100%"} mt={0} pt={5}>
      <Button
        variant="contained"
        color="gray"
        fullWidth
        onClick={props.close}
        size="md"
      >
        {t("common.cancel")}
      </Button>
      <Button
        fullWidth
        onClick={props.onClick}
        disabled={props.buttonDisabled || props.isMutating}
        loading={props.isMutating}
        size="md"
      >
        {buttonText}
      </Button>
    </Flex>
  );

  const renderContent = () => {
    switch (type) {
      case ReferralCodeFormType.Create:
        return (
          <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
            {commissionConfiguration}
            {rebateRateSlider}
            {noCommissionAvailableWarning}
            {buttons}
          </Flex>
        );
      case ReferralCodeFormType.Edit:
        return (
          <>
            {isEditingRefereeRebateRate ? refereeInfo : referralCodeInput}

            <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
              {commissionConfiguration}
              {rebateRateSlider}
              {noCommissionAvailableWarning}
              {buttons}
            </Flex>
          </>
        );
      case ReferralCodeFormType.Reset:
        return (
          <>
            {resetRebateRateLabel}
            {rebateRateSlider}
            {buttons}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Flex
      direction="column"
      itemAlign="start"
      gap={6}
      className="oui-font-semibold"
    >
      {titleView}
      {descriptionView}
      {renderContent()}
    </Flex>
  );
};

type RebateRateSliderProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled: boolean;
  restValue: number;
  disabledIncrease?: boolean;
};

const RebateRateSlider = (props: RebateRateSliderProps) => {
  const { t } = useTranslation();
  const [maxValue] = useState(props.value);

  return (
    <>
      {!props.disabled && (
        <Box width={"100%"} my={2}>
          <Slider
            min={0}
            max={props.max}
            step={1}
            value={[props.value]}
            onValueChange={(value) => {
              const newValue = value[0] as number;
              props.onChange(
                props.disabledIncrease
                  ? Math.min(newValue, maxValue)
                  : newValue,
              );
            }}
            classNames={{
              range: "oui-bg-success-darken oui-h-2 oui-top-[0px]",
              trackInner: "oui-bg-success-darken/30 oui-h-2 oui-top-[0px]",
              thumb: "oui-border-[#d9d9d9] oui-bg-[#d9d9d9] oui-size-4",
            }}
          />
        </Box>
      )}

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
            {props.value}%
          </Text.formatted>
          <Text.formatted size="lg" className="oui-text-success-darken/50">
            {props.restValue}%
          </Text.formatted>
        </Flex>
      </div>
    </>
  );
};

type ReferralCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
  disabled: boolean;
};

const ReferralCodeInput = (props: ReferralCodeInputProps) => {
  const { t } = useTranslation();

  const hasSetCursorToEnd = useRef(false);

  return (
    <TextField
      type="text"
      fullWidth
      label={t("affiliate.referralCode.editCodeModal.label")}
      value={props.value}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
      onFocus={(e) => {
        if (props.autoFocus && !hasSetCursorToEnd.current) {
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
      disabled={props.disabled}
      autoFocus={props.autoFocus}
    />
  );
};

const WarningBox = (props: { children: ReactNode }) => {
  const { children } = props;

  if (typeof children === "string") {
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
          {children}
        </Text>
      </Flex>
    );
  }

  return children;
};
