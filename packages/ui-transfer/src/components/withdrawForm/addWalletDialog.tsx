import { FC, useState, useEffect } from "react";
import { useDebouncedCallback } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { ChainNamespace } from "@orderly.network/types";
import {
  Box,
  Button,
  Input,
  SimpleDialog,
  Text,
  Spinner,
  cn,
  Flex,
  CloseRoundFillIcon,
  ChainIcon,
} from "@orderly.network/ui";
import { CurrentChain } from "../depositForm/hooks";
import { validateWalletAddress } from "./withdrawForm.script";

interface AddWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (address: string, network?: "EVM" | "SOL") => void;
  chain: CurrentChain | null;
}

export const AddWalletDialog: FC<AddWalletDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  chain,
}) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    network?: "EVM" | "SOL";
  } | null>(null);

  const checkAddress = useDebouncedCallback((addr: string) => {
    if (!addr) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }
    const result = validateWalletAddress(addr);
    setValidationResult(result);
    setIsValidating(false);
  }, 500);

  const onAddressChange = (val: string) => {
    setAddress(val);
    if (!val) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    checkAddress(val);
  };

  const onClear = () => {
    setAddress("");
    setValidationResult(null);
    setIsValidating(false);
  };

  useEffect(() => {
    if (!open) onClear();
  }, [open]);

  const requiredNetwork: "EVM" | "SOL" | undefined =
    chain?.namespace === ChainNamespace.solana
      ? "SOL"
      : chain?.namespace === ChainNamespace.evm
        ? "EVM"
        : undefined;

  const requiredNetworkLabel =
    requiredNetwork === "SOL"
      ? "Solana"
      : requiredNetwork === "EVM"
        ? "EVM"
        : "";

  const hasValidation = !!validationResult;
  const isValid = !!validationResult?.valid;
  const isInvalidFormat = hasValidation && !validationResult!.valid;
  const isNetworkMismatch =
    isValid &&
    !!requiredNetwork &&
    validationResult!.network !== requiredNetwork;

  const showBorderDanger =
    !isValidating && hasValidation && (isInvalidFormat || isNetworkMismatch);
  const showProtocolLabel = !isValidating && isValid;
  const showInlineInvalid = !isValidating && isInvalidFormat;
  const showErrorHint = !isValidating && isNetworkMismatch;

  const handleConfirm = () => {
    if (!address || isValidating || !isValid || isNetworkMismatch) return;

    onConfirm(address, validationResult!.network === "SOL" ? "SOL" : "EVM");
    onOpenChange(false);
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("transfer.withdraw.addExternalWallet", "Add external wallet")}
      size="sm"
    >
      <Box className="oui-flex oui-flex-col oui-gap-6 oui-font-semibold oui-tracking-[0.03em]">
        <Flex justify="between">
          <Text size="sm" intensity={54}>
            {t("network.selector.label", "Network")}
          </Text>
          <Flex gapX={1}>
            <ChainIcon chainId={"" + chain?.id} className="oui-w-4 oui-h-4" />
            <Text size="sm">{chain?.info?.network_infos?.shortName}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" gapY={2}>
          <Text size="sm" intensity={54}>
            {
              "Fill in and confirm the address to receive the funds on the destination chain."
            }
          </Text>
          <Text size="sm" intensity={54}>
            {requiredNetworkLabel &&
              `Please do not enter any address other than the ${requiredNetworkLabel} address.`}
          </Text>
        </Flex>
        <Box className="oui-flex oui-flex-col oui-gap-1">
          <Flex justify="between">
            <Text size="2xs" intensity={54}>
              {"Enter external wallet"}
            </Text>
            {isValidating && (
              <Spinner className="oui-w-3.5 oui-h-3.5 oui-text-base-contrast-36" />
            )}
            {showProtocolLabel && (
              <Text
                size="2xs"
                className={cn(
                  isNetworkMismatch
                    ? "oui-text-danger"
                    : "oui-text-primary-light",
                )}
              >
                {validationResult!.network === "EVM" ? "EVM" : "Solana"}
              </Text>
            )}
            {showInlineInvalid && (
              <Text size="2xs" className="oui-text-danger">
                {t("common.invalid", "Invalid")}
              </Text>
            )}
          </Flex>
          <Input
            value={address}
            onValueChange={onAddressChange}
            autoFocus
            color={showBorderDanger ? "danger" : undefined}
            className={cn("oui-bg-transparent oui-bg-base-6")}
            classNames={{ input: "oui-text-white" }}
            suffix={
              address && (
                <Box className="oui-ml-2.5 oui-mr-2 oui-cursor-pointer">
                  <CloseRoundFillIcon
                    size={16}
                    onClick={onClear}
                    className="oui-text-base-contrast-20 hover:oui-text-base-contrast-54"
                  />
                </Box>
              )
            }
          />
          {showErrorHint && (
            <Flex gapX={1} px={1} justify="between" itemAlign="center">
              <Flex gapX={1} itemAlign="center">
                <Box
                  width={4}
                  height={4}
                  r="full"
                  className="oui-bg-danger-light"
                />
                <Text size="2xs" className="oui-text-danger-light">
                  {`This address doesn’t match the selected network. Please enter a valid ${requiredNetworkLabel} address.`}
                </Text>
              </Flex>
            </Flex>
          )}
        </Box>
        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirm}
          disabled={!address || isValidating || !isValid || isNetworkMismatch}
          className="oui-mt-2"
        >
          {t("common.confirm", "Confirm")}
        </Button>
      </Box>
    </SimpleDialog>
  );
};
