import Split from "@uiw/react-split";
import { Footer } from "./footer";
import { Header } from "./header";
import { Layout } from "./layout";
import { Content } from "./content";

export * from "./paper";
export { Page } from "./page";

export type Layout = typeof Layout & {
  Header: typeof Header;
  Footer: typeof Footer;
  Content: typeof Content;
  Split: typeof Split;
};
