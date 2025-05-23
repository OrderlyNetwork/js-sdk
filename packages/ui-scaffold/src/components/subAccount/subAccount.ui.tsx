import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  SimpleDialog,
  useScreen,
  Text,
  Flex,
  ScrollArea,
  modal,
} from "@orderly.network/ui";
import { AccountItem } from "./components/accountItem";
import { CreateSubAccount } from "./components/createSubAccountModal";
import { EditNickNameDialog } from "./components/editNickNameModal";
import { SubAccountIcon, SwapIcon } from "./icons";
import { SubAccountScriptReturn } from "./subAccount.script";

export function SubAccountUI(props: SubAccountScriptReturn) {
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
    <Flex
      direction="column"
      itemAlign="start"
      justify="center"
      px={5}
      width="100%"
      className="oui-h-[120px]"
    >
      <Text className="oui-text-base-contrast-36 oui-text-xs oui-font-semibold oui-text-center">
        Create a sub-account now to explore different trading strategies.
      </Text>
    </Flex>
  );

  const renderSubAccount = () => {
    if (!props.subAccounts?.length) {
      return noSubAccount;
    }
    return (
      <ScrollArea className="oui-max-h-[200px] oui-overflow-y-auto oui-custom-scrollbar oui-w-full">
        <Flex direction="column" gap={2} itemAlign="start" width="100%">
          {props.subAccounts.map((subAccount) => (
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
      </ScrollArea>
    );
  };

  return (
    <>
      {trigger}
      <SimpleDialog
        title={header}
        open={props.open}
        onOpenChange={props.onOpenChange}
        size="xs"
        classNames={{
          content: "oui-w-[300px]",
        }}
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
              <Flex justify="end" gap={2}>
                {props.subAccounts.length > 0 && (
                  <SwapIcon
                    className="oui-cursor-pointer oui-fill-base-contrast-54 hover:oui-fill-base-contrast"
                    onClick={() => {
                      // todo need show transfer modal
                      let dialogId = "TransferDialogId";
                      if (isMobile) {
                        dialogId = "TransferSheetId";
                      }
                      modal.show(dialogId);
                    }}
                  />
                )}
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
