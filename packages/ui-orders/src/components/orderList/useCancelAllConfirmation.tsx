import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAccount, useMemoizedFn } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { modal, Text, toast } from "@orderly.network/ui";

export { assertCancelAllSucceeded } from "@orderly.network/hooks";

export type CancelAllConfirmationOptions = {
  scopeKey: string;
  disabled?: boolean;
  title: string;
  content: ReactNode;
  execute: (isCurrent: () => boolean) => Promise<boolean>;
  onSuccess?: () => unknown | Promise<unknown>;
};

/** Bind a bulk cancellation confirmation to its original account and scope. */
export function useCancelAllConfirmation(
  options: CancelAllConfirmationOptions,
) {
  const { state: account } = useAccount();
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const context = useRef({
    accountId: account.accountId,
    scopeKey: options.scopeKey,
    revision: 0,
  });
  if (
    context.current.accountId !== account.accountId ||
    context.current.scopeKey !== options.scopeKey
  ) {
    context.current = {
      accountId: account.accountId,
      scopeKey: options.scopeKey,
      revision: context.current.revision + 1,
    };
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const currentOptions = useMemoizedFn(() => options);
  const onCancelAll = useMemoizedFn(async (): Promise<boolean> => {
    if (busy.current || currentOptions().disabled || !mounted.current)
      return false;
    busy.current = true;
    setIsConfirming(true);
    const revision = context.current.revision;
    const isCurrent = () =>
      mounted.current && context.current.revision === revision;
    const changedNotice = () =>
      toast.error(t("orders.cancelAll.contextChanged"));
    const initial = currentOptions();
    let submitted = false;
    try {
      const result = await modal.confirm<boolean>({
        title: initial.title,
        content: <Text size="sm">{initial.content}</Text>,
        onCancel: async () => false,
        onOk: async () => {
          if (submitted) return false;
          submitted = true;
          if (!isCurrent()) {
            changedNotice();
            return false;
          }
          if (currentOptions().disabled) return false;
          try {
            const success = await currentOptions().execute(isCurrent);
            if (!isCurrent()) {
              changedNotice();
              return false;
            }
            if (!success) return false;
            await currentOptions().onSuccess?.();
            return true;
          } catch (error) {
            toast.error(
              error instanceof Error && error.message
                ? error.message
                : t("orders.cancelAll.failed"),
            );
            return false;
          }
        },
      });
      return result === true;
    } catch {
      // Dismissing the dialog rejects its promise; it is not a request error.
      return false;
    } finally {
      busy.current = false;
      if (mounted.current) setIsConfirming(false);
    }
  });
  return { onCancelAll, isConfirming };
}
