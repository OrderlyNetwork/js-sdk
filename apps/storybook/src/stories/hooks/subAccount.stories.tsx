import { FC, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { SubAccount } from "@orderly.network/core";
import { useAccount, useBoolean } from "@orderly.network/hooks";
import {
  Box,
  Button,
  DataTable,
  Flex,
  TriggerDialog,
  Input,
  toast,
  Column,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

const UpdateSubAccountDialog: FC<{
  subAccountId: string;
  description?: string;
  // closeModal: () => void;
  updateSubAccount: (value: {
    subAccountId: string;
    description?: string;
  }) => Promise<any>;
}> = ({ subAccountId, updateSubAccount, description }) => {
  const [desc, setDesc] = useState(description);
  // const modal = useModal();
  const [loading, { setTrue, setFalse }] = useBoolean(false);
  return (
    <TriggerDialog
      title="Update SubAccount"
      trigger={<Button size={"sm"}>Update</Button>}
      actions={{
        primary: {
          label: "Update",
          onClick: () => {
            setTrue();
            return updateSubAccount({
              subAccountId,
              description: desc,
            })
              .catch((error) => {
                toast.error(error.message);
              })
              .finally(() => {
                setFalse();
              });
          },
        },
      }}
    >
      <div>
        <Input
          prefix="Nick Name"
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        {/* <Button type="submit" loading={loading}>
          Update
        </Button> */}
      </div>
    </TriggerDialog>
  );
};

const SubAccountExample = () => {
  const { state, subAccount, switchAccount, isMainAccount } = useAccount();

  const createSubAccountHandler = () => {
    subAccount.create();
  };

  const updateSubAccountHandler = (value: {
    subAccountId: string;
    description?: string;
  }) => {
    // updateSubAccount(value);
    console.log("updateSubAccountHandler", value);

    return subAccount.update(value);
  };

  const columns: Column<SubAccount>[] = [
    {
      dataIndex: "id",
      title: "ID",
      width: 400,
    },
    {
      dataIndex: "description",
      title: "Description",
      width: 80,
    },
    {
      dataIndex: "balance",
      title: "Balance",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      render: (_, record) => {
        return (
          <Flex gap={2}>
            <UpdateSubAccountDialog
              subAccountId={record.id}
              updateSubAccount={updateSubAccountHandler}
              description={record.description}
            />
            <Button size={"sm"} onClick={() => switchAccount(record.id)}>
              Switch
            </Button>
          </Flex>
        );
      },
    },
  ];

  // const updateSubAccountHandler = () => {
  //   // updateSubAccount();
  // };

  console.log("sub accounts", state);

  return (
    <AuthGuard>
      <Box p={3} intensity={100}>
        <Flex gap={2} justify={"between"}>
          {/* <Text>{state.subAccounts?.length}</Text> */}
          <Button onClick={createSubAccountHandler}>Create SubAccount</Button>
          {/* <Button onClick={updateSubAccountHandler}>Update SubAccount</Button> */}
          <div>{`current account: ${state.accountId}, isMainAccount: ${isMainAccount}`}</div>
        </Flex>
      </Box>
      <div>
        <DataTable columns={columns} dataSource={state.subAccounts ?? []} />
      </div>
    </AuthGuard>
  );
};

const meta: Meta = {
  title: "Hooks/SubAccount",
  component: SubAccountExample,
  //   parameters: {
  //     layout: "centered",
  //   },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
