import { Card, Divider, Flex,Text } from "@orderly.network/ui";

export const APIManager = () => {
  return (
    <Card title={"API keys"} id="portfolio-apikey-manager" className="oui-bg-base-9">
      
      <Flex>
        <Divider/>
        <Card title={"Account ID"} className="oui-bg-base-7">
          <Text.formatted rule={"address"} copyable>
            {"0xasfsfsdfsdfsdfdfs"}
          </Text.formatted>
        </Card>
        <Card title={"Account ID"}>
          <Text.formatted rule={"address"} copyable>
            {"0xasfsfsdfsdfsdfdfs"}
          </Text.formatted>
        </Card>
      </Flex>
    </Card>
  );
};
