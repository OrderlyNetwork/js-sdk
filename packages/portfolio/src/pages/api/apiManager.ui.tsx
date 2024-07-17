import {
  ArrowLeftRightIcon,
  Button,
  Card,
  DataTable,
  Divider,
  EmptyDataState,
  Flex,
  PlusIcon,
  Text,
} from "@orderly.network/ui";
import {
  ApiManagerScriptReturns,
  capitalizeFirstChar,
} from "./apiManager.script";
import { FC, useState } from "react";
import { Column } from "@orderly.network/ui";
import { CreateAPIKeyDialog } from "./dialog/createApiKey";
import { CreatedAPIKeyDialog } from "./dialog/createdApiKey";
import { DeleteAPIKeyDialog } from "./dialog/deleteApiKey";
import { EditAPIKeyDialog } from "./dialog/editApiKey";
import { AccountStatusEnum } from "@orderly.network/types";
import { AuthGuard, AuthGuardEmpty } from "@orderly.network/ui-connector";
import { APIKeyItem } from "@orderly.network/hooks";

export const APIManager: FC<ApiManagerScriptReturns> = (props) => {
  return (
    <Card
      title={"API keys"}
      id="portfolio-apikey-manager"
      className="oui-bg-base-9 oui-font-semibold"
    >
      <Flex direction={"column"} gap={4} width={"100%"} className="oui-font-semibold">
        <AccountInfo {...props} />
        <Subtitle {...props} />
        <KeyList {...props} />
        <CreateAPIKeyDialog {...props} />
        <CreatedAPIKeyDialog {...props} />
      </Flex>
    </Card>
  );
};

const AccountInfo: FC<ApiManagerScriptReturns> = (props) => {
  return (
    <Flex
      width={"100%"}
      gap={4}
      className="oui-border-t-2 oui-border-line-6 oui-pt-4"
    >
      <Flex
        py={2}
        px={4}
        direction={"column"}
        itemAlign={"start"}
        r="xl"
        gradient="neutral"
        angle={27}
        className="oui-w-1/2"
      >
        <Text size="xs" intensity={36}>
          Account ID
        </Text>
        <Text.formatted size="base" inlist={80} rule={"address"} copyable>
          {props.address}
        </Text.formatted>
      </Flex>
      <Flex
        py={2}
        px={4}
        direction={"column"}
        itemAlign={"start"}
        r="xl"
        gradient="neutral"
        angle={27}
        className="oui-w-1/2"
      >
        <Text size="xs" intensity={36}>
          UID
        </Text>
        <Text size="base" inlist={80}>
          {props.uid}
        </Text>
      </Flex>
    </Flex>
  );
};

const Subtitle: FC<ApiManagerScriptReturns> = (props) => {
  return (
    <Flex
      width={"100%"}
      direction={"row"}
      className="oui-text-sm oui-border-b-2 oui-border-line-6 oui-pb-4"
    >
      <Flex
        direction={"column"}
        itemAlign={"start"}
        width={"100%"}
        gap={1}
        onClick={props.onReadApiGuide}
      >
        <Text intensity={54}>
          Create API keys to suit your trading needs. For your security, don't
          share your API keys with anyone.{" "}
        </Text>
        <Flex className="oui-text-primary oui-fill-white/[.54] hover:oui-text-primary-light hover:oui-fill-white/[.8] oui-cursor-pointer">
          <Text>Read API guide</Text>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            fillOpacity="1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.777 3.348a.65.65 0 0 0-.498.083.685.685 0 0 0-.187.938L8.5 7.993 6.092 11.62a.685.685 0 0 0 .187.937.68.68 0 0 0 .934-.187l2.657-4a.69.69 0 0 0 0-.75l-2.657-4a.67.67 0 0 0-.436-.271" />
          </svg>
        </Flex>
      </Flex>
      <Button
        size="md"
        icon={<PlusIcon />}
        variant="contained"
        color="primary"
        onClick={props.onCreateApiKey}
        disabled={!props.canCreateApiKey}
      >
        Create API key
      </Button>
    </Flex>
  );
};

const KeyList: FC<ApiManagerScriptReturns> = (props) => {
  const columns: Column<APIKeyItem>[] = [
    {
      title: "API key",
      dataIndex: "orderly_key",
      render: (value) => {
        return (
          <Text.formatted rule={""} copyable>
            {formatKey(value)}
          </Text.formatted>
        );
      },
    },
    {
      title: "Permission type",
      dataIndex: "scope",
      render: (value) =>
        value
          ?.split(",")
          .map((e: any) => capitalizeFirstChar(`${e}`))
          .join(","),
    },
    {
      title: "Restricted IP",
      dataIndex: "ip_restriction_list",
      render: (value) => {
        let ip = value.join(",");
        if (ip.length === 0) {
          ip = "-";
        }
        return <Text className="oui-text-ellipsis">{ip}</Text>;
      },
    },
    {
      title: "Expiration date",
      dataIndex: "expiration",
      render: (value) => (
        <Text.formatted rule={"date"} formatString="yyyy-MM-dd">
          {value}
        </Text.formatted>
      ),
    },
    {
      title: "",
      dataIndex: "action",
      width: 120,
      render: (_, item) => {
        return (
          <Flex direction={"row"} gap={2}>
            <EditButton item={item} onUpdate={props.doEdit} />
            <DeleteButton item={item} onDelete={props.doDelete} />
          </Flex>
        );
      },
    },
  ];
  return (
    <DataTable
      bordered
      columns={columns}
      dataSource={props.keys}
      scroll={{ y: 300 }}
      emptyView={<AuthGuardEmpty />}
      classNames={{
        header: "oui-bg-base-9 oui-text-xs oui-text-base-contrast-36",
        body: "oui-text-xs oui-text-base-contrast-80"
      }}
    />
  );
};

const EditButton: FC<{
  item: APIKeyItem;
  onUpdate: (item: APIKeyItem, ip?: string) => Promise<void>;
}> = (props) => {
  const { item, onUpdate } = props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="xs"
        color="primary"
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Edit
      </Button>

      <EditAPIKeyDialog
        item={item}
        open={open}
        setOpen={setOpen}
        onUpdate={onUpdate}
      />
    </>
  );
};

const DeleteButton: FC<{
  item: APIKeyItem;
  onDelete: (item: APIKeyItem) => Promise<void>;
}> = (props) => {
  const { item, onDelete } = props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="xs"
        color="gray"
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Delete
      </Button>

      <DeleteAPIKeyDialog
        item={item}
        open={open}
        setOpen={setOpen}
        onDelete={onDelete}
      />
    </>
  );
};

export function formatKey(value: string): string {
  if (typeof value === "undefined") return "-";
  const key = `${value}`.replace("ed25519:", "").slice(0, 6);
  return `${key}*****`;
}
