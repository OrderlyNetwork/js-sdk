import { FC, useContext } from "react";
import { Layout } from "@/layout";
import { TopNavbar } from "../common/topNavbar";
import { Footer } from "@/layout/footer";
import { SystemStatusBar } from "@/block/systemStatusBar";
import { OrderlyAppContext } from "@/provider";
import { DataList } from "./dataList";

const { Header, Content } = Layout;

export const Portfolio: FC = (props) => {
  const { footerStatusBarProps } = useContext(OrderlyAppContext);

  return (
    <Layout>
      <Header className="orderly-app-trading-header orderly-border-b orderly-border-divider">
        <TopNavbar />
      </Header>

      <Layout style={{ paddingBottom: "42px" }}>
        <Content className=" orderly-px-[82px] orderly-py-[53px]">
          <DataList />
        </Content>
      </Layout>

      <Footer
        fixed
        className="orderly-bg-base-900 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between orderly-border-t-[1px] orderly-border-base-500 orderly-z-50"
      >
        <SystemStatusBar
          xUrl={footerStatusBarProps?.xUrl}
          telegramUrl={footerStatusBarProps?.telegramUrl}
          discordUrl={footerStatusBarProps?.discordUrl}
        />
      </Footer>
    </Layout>
  );
};
