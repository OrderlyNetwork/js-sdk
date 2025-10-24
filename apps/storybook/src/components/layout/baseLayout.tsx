import { FC, ReactNode, useState } from "react";
import { SimpleDialog, Text } from "@orderly.network/ui";
import {
  Scaffold,
  ScaffoldProps,
  RouteOption,
} from "@orderly.network/ui-scaffold";
import { footerConfig, useBottomNav, useMainNav } from "../../orderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
  topBar?: ReactNode;
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const bottomNavProps = useBottomNav();
  const mainNavProps = useMainNav();

  const { onRouteChange } = useRouteContext();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleRouteChange = (option: RouteOption) => {
    if (option.name === "AI") {
      setAiDialogOpen(true);
      return;
    }
    onRouteChange(option);
  };

  return (
    <>
      <Scaffold
        topBar={props.topBar}
        mainNavProps={{
          ...mainNavProps,
          initialMenu: props.initialMenu || PathEnum.Root,
          // customRender: useCustomRender(),
        }}
        bottomNavProps={bottomNavProps}
        footerProps={footerConfig}
        routerAdapter={{ onRouteChange: handleRouteChange }}
        classNames={props.classNames}
      >
        {props.children}
      </Scaffold>
      <SimpleDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        title="Note"
        size="xs"
      >
        <Text>Coming soon</Text>
      </SimpleDialog>
    </>
  );
};
