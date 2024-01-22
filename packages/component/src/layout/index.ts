import Split from "@uiw/react-split";
import { Footer } from "./footer";
import { Header } from "./header";
import { Layout as BaseLayout } from "./layout";
import { Content } from "./content";
import { PageHeader } from "./pageHeader";
import { Sider } from "./sider";

export * from "./paper";
export { Page } from "./page";

type Layout = typeof BaseLayout & {
  Header: typeof Header;
  Footer: typeof Footer;
  Content: typeof Content;
  Sider: typeof Sider;
  Split: typeof Split;
  PageHeader: typeof PageHeader;
};

const Layout = BaseLayout as Layout;
Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;
Layout.Sider = Sider;
Layout.Split = Split;
Layout.PageHeader = PageHeader;

export { Layout };
