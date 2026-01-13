import { ReactNode, useState } from "react";
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

export type ReferralCodeFormProps = ReferralCodeFormReturns & {
  type: "create" | "edit";
  close?: () => void;
};

export const ReferralCodeForm = (props: ReferralCodeFormProps) => {
  const { t } = useTranslation();
  const [newCode, setNewCode] = useState<string>("");

  const isCreate = props.type === "create";

  const title = isCreate
    ? t("affiliate.referralCodes.create.modal.title")
    : t("affiliate.referralCodes.edit.modal.title");

  const createWarning = isCreate && (
    <WarningBox
      description={t("affiliate.multiLevel.referralCode.create.warning")}
    />
  );

  const editReferralCodeWarning = props.type === "edit" && (
    <WarningBox description={t("affiliate.referralCode.edit.warning")} />
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

      <TextField
        type="text"
        placeholder=""
        fullWidth
        label={t("affiliate.referralCode.editCodeModal.label")}
        onClean={() => {
          setNewCode("");
        }}
        value={newCode}
        onChange={(e) => {
          const _value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
          setNewCode(_value);
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
          input:
            "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
        }}
        maxLength={10}
        minLength={4}
        autoComplete="off"
      />

      <Flex width={"100%"} direction="column" itemAlign="start" gap={2}>
        <Text size="2xs" intensity={54}>
          {t("affiliate.commissionConfiguration")}
        </Text>
        <Text size="2xs" intensity={54}>
          {t("affiliate.totalCommissionAvailable")}:{" "}
          <Text className="oui-text-warning">40%</Text>
        </Text>

        <Box width={"100%"} my={2}>
          <Slider
            min={0}
            max={100}
            value={[50]}
            classNames={{
              range: "oui-bg-success-darken oui-h-2 oui-top-[0px]",
              trackInner: "oui-bg-success-darken/30 oui-h-2 oui-top-[0px]",
              thumb: "oui-border-[#d9d9d9] oui-bg-[#d9d9d9] oui-size-4",
            }}
          />
        </Box>

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
              30%
            </Text.formatted>
            <Text.formatted size="lg" className="oui-text-success-darken/50">
              10%
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
            onClick={props.onCreate}
            data-testid="oui-testid-leverage-save-btn"
            size="md"
          >
            {t("affiliate.review")}
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
