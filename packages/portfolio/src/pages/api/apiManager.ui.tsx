import {
  ArrowLeftRightIcon,
  Button,
  Card,
  DataTable,
  Divider,
  Flex,
  PlusIcon,
  Text,
} from "@orderly.network/ui";
import { ApiManagerScriptReturns } from "./apiManager.script";
import { FC } from "react";
import { Column } from "@orderly.network/ui";
import { CreateAPIKeyDialog } from "./dialog/createApiKey";

export const APIManager: FC<ApiManagerScriptReturns> = (props) => {
  return (
    <Card
      title={"API keys"}
      id="portfolio-apikey-manager"
      className="oui-bg-base-9 oui-font-semibold"
    >
      <Flex direction={"column"} gap={4} width={"100%"}>
        <AccountInfo {...props} />
        <Subtitle {...props} />
        <KeyList {...props} />
        <CreateAPIKeyDialog {...props}/>
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
      >
        Create API key
      </Button>
    </Flex>
  );
};

const KeyList: FC<ApiManagerScriptReturns> = (props) => {
  const columns: Column[] = [
    {
      title: "API key",
      dataIndex: "api_key",
    },
    {
      title: "Permission type",
      dataIndex: "permission_type",
    },
    {
      title: "Restricted IP",
      dataIndex: "Restricted",
    },
    {
      title: "Expiration date",
      dataIndex: "Expiration",
    },
    {
      title: "",
      dataIndex: "action",
      width: 120,
      render: (_) => {

        return (
          <Flex direction={"row"} gap={2}>
            <Button size="xs" color="primary" variant="contained">Edit</Button>
            <Button size="xs" color="gray" variant="contained">Delete</Button>
          </Flex>
        );
      }
    },
  ];
  return (
      <DataTable bordered columns={columns} dataSource={[1,2,3,4,5,6,7,8,9]} scroll={{y: 300}}/>
  );
};
