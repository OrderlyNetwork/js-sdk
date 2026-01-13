import { useFaqScript } from "./faq.script";
import { Faq } from "./faq.ui";

export const FaqWidget = () => {
  const state = useFaqScript();
  return <Faq {...state} />;
};
