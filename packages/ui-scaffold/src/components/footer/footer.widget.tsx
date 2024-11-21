import { useFooterScript } from "./footer.script";
import { Footer } from "./footer.ui";

export type FooterProps = {
  telegramUrl?: string;
  twitterUrl?: string;
  discordmUrl?: string;
};

export const FooterWidget = (props: FooterProps) => {
  const state = useFooterScript();
  return <Footer {...state} {...props} />;
};
