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
} from "@orderly.network/ui";
import { ReferralCodeFormReturns } from "./referralCodeForm.script";
import { ReferralCodeFormWidgetProps } from "./referralCodeForm.widget";

export type ReferralCodeFormProps = ReferralCodeFormReturns &
  ReferralCodeFormWidgetProps;

export const ReferralCodeForm = (props: ReferralCodeFormProps) => {
  const { isReview } = props;
  const { t } = useTranslation();

  const isCreate = props.type === "create";
  const isEdit = props.type === "edit";

  const title = isCreate
    ? t("affiliate.referralCodes.create.modal.title")
    : t("affiliate.referralCodes.edit.modal.title");

  const buttonText = isCreate
    ? t("affiliate.confirmAndGenerate")
    : isReview
      ? t("affiliate.saveChanges")
      : t("affiliate.review");

  const createWarning = isCreate && (
    <WarningBox
      description={t("affiliate.multiLevel.referralCode.create.warning")}
    />
  );

  const editReferralCodeWarning = isEdit && (
    <WarningBox
      description={
        isReview
          ? t("affiliate.review.warning")
          : t("affiliate.referralCode.edit.warning")
      }
    />
  );

  const autoFocus = props.field === "referralCode";
  const hasSetCursorToEnd = useRef(false);

  const referralCodeInput = (
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

  const slider = (
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

  return (
    <Flex
      direction="column"
      itemAlign="start"
      gap={6}
      className="oui-font-semibold"
    >
      <Flex width={"100%"} direction="column" itemAlign="start" gap={3}>
        <Text size="base" intensity={98}>
          {title}
        </Text>
        <Divider intensity={8} className="oui-w-full" />
      </Flex>

      {createWarning}
      {editReferralCodeWarning}

      {isEdit && referralCodeInput}

      <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
        <Text size="2xs" intensity={54}>
          {t("affiliate.commissionConfiguration")}
        </Text>
        {!isReview && (
          <Text size="2xs" intensity={54}>
            {t("affiliate.totalCommissionAvailable")}:{" "}
            <Text className="oui-text-warning">
              {props.maxRebatePercentage}%
            </Text>
          </Text>
        )}

        {!isReview && slider}

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
            {buttonText}
          </Button>
        </Flex>
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
