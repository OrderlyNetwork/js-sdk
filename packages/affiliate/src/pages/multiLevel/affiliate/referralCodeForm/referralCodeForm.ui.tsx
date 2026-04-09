import { ReactNode, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  inputFormatter,
  Slider,
  Text,
  TextField,
  WarningIcon,
  Divider,
  formatAddress,
} from "@orderly.network/ui";
import { GiftIcon } from "../../../../icons/giftIcon";
import { ReferralCodeFormField, ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormReturns } from "./referralCodeForm.script";
import { ReferralCodeFormWidgetProps } from "./referralCodeForm.widget";

export type ReferralCodeFormProps = ReferralCodeFormReturns &
  Omit<ReferralCodeFormWidgetProps, "type">;

export const ReferralCodeForm = (props: ReferralCodeFormProps) => {
  const { type, isReview } = props;
  const { t } = useTranslation();

  const isBind = type === ReferralCodeFormType.Bind;
  const isReset = type === ReferralCodeFormType.Reset;
  const hasBoundReferee = !!props.directInvites && props.directInvites > 0;

  const isEditingRefereeRebateRate = !!props.accountId;

  const noCommissionAvailable = props.maxRebateRate === 0;

  const { title, description, buttonText } = useMemo(() => {
    switch (type) {
      case ReferralCodeFormType.Bind:
        return {
          title: t("affiliate.referralCode.bind.modal.title"),
          description: (
            <Text
              size="2xs"
              intensity={54}
              className="oui-leading-[18px] oui-text-warning-darken"
            >
              {t("affiliate.referralCode.bind.modal.description")}
            </Text>
          ),
          buttonText: t("common.confirm"),
        };
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
            ? t("affiliate.confirmChanges")
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
    <Flex
      width={"100%"}
      direction="column"
      itemAlign="start"
      gap={3}
      className="oui-referralCodeForm-header"
    >
      <Text size="base" intensity={98}>
        {title}
      </Text>
      <Divider intensity={8} className="oui-w-full" />
    </Flex>
  );

  const descriptionView = <WarningBox>{description}</WarningBox>;

  const bindCodeInvalid =
    isBind &&
    !props.skipBinding &&
    props.formattedBindCode.length >= 4 &&
    !props.isBindCodeChecking &&
    props.isBindCodeExist === false;

  const bindReferralCodeInput = (
    <ReferralCodeInput
      value={props.bindCodeInput}
      onChange={props.setBindCodeInput}
      autoFocus
      disabled={props.skipBinding}
      placeholder={t("affiliate.referralCode.bind.input.placeholder")}
      helpText={
        bindCodeInvalid ? t("affiliate.referralCode.notExist") : undefined
      }
      color={bindCodeInvalid ? "danger" : undefined}
    />
  );

  const referralCodeInput = (
    <ReferralCodeInput
      value={props.newCode}
      onChange={props.setNewCode}
      autoFocus={props.focusField === ReferralCodeFormField.ReferralCode}
      disabled={isReview || hasBoundReferee}
      label={t("affiliate.referralCode.editCodeModal.label")}
    />
  );

  const bindCheckbox = isBind && (
    <Flex className="oui-gap-[6px]">
      <Checkbox
        color="white"
        id="oui-checkbox-skipReferralBinding"
        checked={props.skipBinding}
        onCheckedChange={(checked: boolean) => {
          props.setSkipBinding(checked);
          if (checked) {
            props.setBindCodeInput("");
          }
        }}
      />
      <label
        htmlFor="oui-checkbox-skipReferralBinding"
        className="oui-text-2xs oui-font-normal oui-text-base-contrast-54"
      >
        {t("affiliate.referralCode.bind.skip")}
      </label>
    </Flex>
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
      directBonusRebateRate={props.directBonusRebateRate}
      noCommissionAvailable={noCommissionAvailable}
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
        className="oui-referralCodeForm-cancel-btn"
      >
        {t("common.cancel")}
      </Button>
      <Button
        fullWidth
        onClick={props.onClick}
        disabled={props.buttonDisabled || props.isMutating}
        loading={props.isMutating}
        size="md"
        className="oui-referralCodeForm-confirm-btn"
      >
        {buttonText}
      </Button>
    </Flex>
  );

  const renderContent = () => {
    switch (type) {
      case ReferralCodeFormType.Bind:
        return (
          <Flex width={"100%"} direction="column" itemAlign="start" gap={4}>
            {bindReferralCodeInput}
            {bindCheckbox}
            {buttons}
          </Flex>
        );
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
          <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
            {resetRebateRateLabel}
            {rebateRateSlider}
            {buttons}
          </Flex>
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
      className="oui-affiliate-referralCodeForm oui-font-semibold"
    >
      {titleView}
      {descriptionView}
      {renderContent()}
    </Flex>
  );
};

const NoCommissionCard = (props: { directBonusRebateRate?: number }) => {
  const { t } = useTranslation();
  const amount = props.directBonusRebateRate;

  if (!amount || amount <= 0) {
    return null;
  }

  return (
    <Flex
      direction="column"
      gap={2}
      mt={2}
      width={"100%"}
      p={4}
      r="lg"
      className="oui-border oui-border-base-contrast/[0.08] oui-tracking-[0.03em]"
    >
      <Flex justify="between" width={"100%"} itemAlign="center">
        <Flex direction="column" itemAlign="start" gap={1}>
          <Text size="2xs" intensity={54}>
            {t("affiliate.noCommissionCard.title")}
          </Text>
          <Text size="lg" className="oui-font-semibold oui-text-primary-light">
            + {amount}%
          </Text>
        </Flex>
        <GiftIcon size={24} className="oui-shrink-0 oui-text-primary-light" />
      </Flex>
      <Text size="2xs" intensity={98} className="oui-leading-[15px]">
        {t("affiliate.noCommissionCard.content", { amount })}
      </Text>
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
  directBonusRebateRate?: number;
  noCommissionAvailable?: boolean;
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
            {t("affiliate.refereesGet")}
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

        {props.noCommissionAvailable ? (
          <NoCommissionCard
            directBonusRebateRate={props.directBonusRebateRate}
          />
        ) : (
          props.directBonusRebateRate != null &&
          props.directBonusRebateRate > 0 && (
            <Flex gap={2} mt={2} width={"100%"}>
              <GiftIcon
                size={16}
                className="oui-mt-px oui-text-base-contrast"
              />
              <Text
                size="base"
                intensity={54}
                as="span"
                className="oui-inline-flex oui-items-center oui-gap-1 oui-tracking-[0.03em]"
              >
                <Trans
                  i18nKey="affiliate.extraBonusOnDirectReferrals"
                  values={{ amount: props.directBonusRebateRate }}
                  components={[<Text as="span" color="primaryLight" key="0" />]}
                />
              </Text>
            </Flex>
          )
        )}
      </div>
    </>
  );
};

type ReferralCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
  disabled: boolean;
  label?: string;
  placeholder?: string;
  helpText?: string;
  color?: "danger";
};

const ReferralCodeInput = (props: ReferralCodeInputProps) => {
  const hasSetCursorToEnd = useRef(false);

  return (
    <TextField
      type="text"
      fullWidth
      label={props.label ?? ""}
      placeholder={props.placeholder}
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
      helpText={props.helpText}
      color={props.color}
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
