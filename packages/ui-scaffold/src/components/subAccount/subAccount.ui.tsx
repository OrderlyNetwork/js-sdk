import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  SimpleDialog,
  useScreen,
  Text,
  Flex,
  formatAddress,
  Input,
  Button,
  toast,
  cn,
  inputFormatter,
  TextField,
} from "@orderly.network/ui";
import { AddIcon, SubAccountIcon, SwapIcon, EditIcon } from "./icons";
import { SubAccountScriptReturn } from "./subAccount.script";

type CreateSubAccountProps = {
  create: (nickName: string) => Promise<void>;
};

const helpText = "5-20 characters. Special characters not allowed.";
const MAX_SUB_ACCOUNT_COUNT = 10;

function CreateSubAccount(props: CreateSubAccountProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const [open, setOpen] = useState(false);
  const [nickName, setNickName] = useState<string | undefined>(undefined);
  const { state } = useAccount();
  const subAccountCount = useMemo(() => {
    return state.subAccounts?.length ?? 0;
  }, [state]);
  const trigger = <AddIcon opacity={0.54} onClick={() => setOpen(true)} />;
  const header = (
    <Flex
      py={3}
      direction="column"
      justify="between"
      itemAlign="start"
      width="100%"
    >
      <Text weight="semibold">Create sub-account</Text>
      <Text className="oui-text-2xs oui-text-base-contrast-36">
        You have {subAccountCount} sub-accounts.{" "}
        {MAX_SUB_ACCOUNT_COUNT - subAccountCount} more can be created.
      </Text>
    </Flex>
  );

  const reset = () => {
    setNickName("");
  };

  const doCreatSubAccount = (nickName: string | undefined) => {
    let _nickName = `Sub-account ${subAccountCount + 1}`;
    if (nickName) {
      _nickName = nickName.trim();
    }

    props
      .create(_nickName)
      .then((res) => {
        console.log("res", res);
        reset();
        toast.success("Sub-account created successfully.");

        setOpen(false);
      })
      .catch((e: any) => {
        toast.error("Failed to create sub-account.");
      });
  };
  return (
    <>
      {trigger}
      <SimpleDialog
        title={header}
        open={open}
        onOpenChange={(open) => {
          reset();
          setOpen(open);
        }}
        size={isMobile ? "sm" : "xl"}
        actions={{
          primary: {
            label: t("common.confirm"),
            onClick: () => doCreatSubAccount(nickName),
          },
        }}
      >
        <Text>Sub-account nickname</Text>
        <TextField
          placeholder={`Sub-account ${subAccountCount + 1}`}
          fullWidth
          label=""
          value={nickName}
          onChange={(e) => {
            setNickName(e.target.value);
          }}
          classNames={{
            label: "oui-text-base-contrast-54 oui-text-xs",
            input:
              "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
          }}
          maxLength={20}
          minLength={5}
          autoComplete="off"
          helpText={helpText}
          className="oui-mb-4"
        />
      </SimpleDialog>
    </>
  );
}

const EditNickNameDialog = (props: {
  nickName: string;
  open: boolean;
  accountId: string;
  onOpenChange: (open: boolean) => void;
}) => {
  const { subAccount } = useAccount();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [newNickName, setNewNickName] = useState(props.nickName);
  useEffect(() => {
    setNewNickName(props.nickName);
  }, [props.nickName]);
  return (
    <SimpleDialog
      title={<Text>Edit nickname</Text>}
      open={props.open}
      onOpenChange={props.onOpenChange}
      actions={{
        primary: {
          label: t("common.confirm"),
          disabled: loading,
          loading: loading,
          onClick: () => {
            setLoading(true);
            subAccount
              ?.update({
                subAccountId: props.accountId,
                description: newNickName,
              })
              .catch((e) => {
                console.log("e", e);
                toast.error(e.message);
              })
              .then((res) => {
                toast.success("Nickname updated successfully.");
                props.onOpenChange(false);
              })
              .finally(() => {
                setLoading(false);
              });
          },
        },
        secondary: {
          label: t("common.cancel"),
          onClick: () => props.onOpenChange(false),
        },
      }}
    >
      <Text>Sub-account nickname</Text>
      <TextField
        placeholder={`Sub-account 1`}
        fullWidth
        label=""
        value={newNickName}
        onChange={(e) => {
          setNewNickName(e.target.value);
        }}
        classNames={{
          label: "oui-text-base-contrast-54 oui-text-xs",
          input:
            "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
        }}
        maxLength={20}
        minLength={5}
        autoComplete="off"
        helpText={helpText}
        className="oui-mb-4"
      />
    </SimpleDialog>
  );
};

interface AccountItemProps {
  isMainAccount?: boolean;
  accountId: string;
  description?: string;
  userAddress?: string;
  balance?: string;
  isCurrent?: boolean;
  onSwitch?: (accountId: string) => void;
  holdings?: { token: string; holding: number }[];
  onEdit?: (accountItem: { accountId: string; description: string }) => void;
}

const AccountItem = (props: AccountItemProps) => {
  const holdings = useMemo(() => {
    if (!props.holdings || !props.holdings.length) {
      return [{ holding: 0, token: "USDC" }];
    }
    return props.holdings;
  }, [props.holdings]);
  return (
    <>
      <Flex
        justify="between"
        itemAlign="center"
        width="100%"
        className={cn(
          "oui-bg-base-6 oui-px-3 oui-py-4 oui-relative oui-rounded-[6px] oui-cursor-pointer",
          props.isCurrent && "oui-border oui-border-[#38E2FE] ",
        )}
        onClick={() => {
          if (props.isCurrent) {
            return;
          }
          props.onSwitch?.(props.accountId);
        }}
      >
        {props.isCurrent && (
          <div
            className={cn(
              "oui-absolute -oui-top-[1px] -oui-right-[1px] oui-text-xs oui-leading-3 oui-text-base-contrast-54",
              "oui-text-[10px] oui-font-semibold oui-text-black",
              "oui-px-1 oui-py-0.5 oui-rounded-[6px] oui-rounded-tl-none oui-rounded-br-none  oui-bg-[#38E2FE]",
            )}
          >
            Current
          </div>
        )}
        <Flex
          key={props.accountId}
          direction="column"
          itemAlign="start"
          gap={1}
        >
          {props.isMainAccount ? (
            <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast">
              {formatAddress(props.userAddress ?? "")}
            </Text>
          ) : (
            <Flex
              justify="start"
              itemAlign="center"
              className="oui-gap-[2px] oui-cursor-pointer"
              onClick={(event) => {
                props.onEdit?.({
                  accountId: props.accountId,
                  description: props.description ?? "",
                });
                event.stopPropagation();
                event.preventDefault();
              }}
            >
              <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast">
                {props.description}
              </Text>
              <EditIcon />
            </Flex>
          )}
          <Text className="oui-text-2xs oui-leading-3 oui-text-base-contrast-36">
            ID: {formatAddress(props.accountId)}
          </Text>
        </Flex>
        <Flex>
          {holdings.map((holding) => (
            <Flex key={holding.token}>
              {holding.holding} {holding.token}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export function SubAccountUI(props: SubAccountScriptReturn) {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const header = <Text weight="semibold">Switch account</Text>;
  const trigger = <SubAccountIcon onClick={() => props.onOpenChange(true)} />;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAccountItem, setEditAccountItem] = useState<
    | {
        accountId: string;
        description: string;
      }
    | undefined
  >(undefined);

  const noSubAccount = (
    <Text>
      Create a sub-account now to explore different trading strategies.
    </Text>
  );

  const renderSubAccount = () => {
    if (!props.subAccountList?.length) {
      return noSubAccount;
    }
    return (
      <Flex direction="column" gap={2} itemAlign="start" width="100%">
        {props.subAccountList.map((subAccount) => (
          <AccountItem
            key={subAccount.id}
            accountId={subAccount.id}
            description={subAccount.description}
            isMainAccount={false}
            isCurrent={subAccount.id === props.currentAccountId}
            onSwitch={(accountId) => {
              props.onSwitch?.(accountId);
            }}
            holdings={subAccount.holding}
            onEdit={() => {
              setEditAccountItem({
                accountId: subAccount.id,
                description: subAccount.description,
              });
              setEditDialogOpen(true);
            }}
          />
        ))}
      </Flex>
    );
  };

  return (
    <>
      {trigger}
      <SimpleDialog
        title={header}
        open={props.open}
        onOpenChange={props.onOpenChange}
        size={isMobile ? "sm" : "xl"}
      >
        <Flex direction="column" gap={5} itemAlign="start" width="100%">
          <Flex direction="column" gap={2} itemAlign="start" width="100%">
            <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast-54">
              Main account
            </Text>
            <AccountItem
              accountId={props.mainAccountId ?? ""}
              isMainAccount={true}
              userAddress={props.userAddress}
              isCurrent={props.currentAccountId === props.mainAccountId}
              onSwitch={(accountId) => {
                props.onSwitch?.(accountId);
              }}
            />
          </Flex>

          <Flex direction="column" gap={2} itemAlign="start" width="100%">
            <Flex justify="between" itemAlign="center" width="100%" gap={2}>
              <Text className="oui-text-xs oui-leading-3 oui-text-base-contrast-54">
                Sub-account
              </Text>
              <Flex>
                <SwapIcon />
                <CreateSubAccount create={props.createSubAccount} />
              </Flex>
            </Flex>
            {renderSubAccount()}
          </Flex>
        </Flex>
      </SimpleDialog>

      <EditNickNameDialog
        accountId={editAccountItem?.accountId ?? ""}
        nickName={editAccountItem?.description ?? ""}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
