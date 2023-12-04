// import * as hookRaw from "./hook?raw";
import type { FC, CSSProperties } from "react";
import { Sandpack, SandpackInternal } from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
// import { atomDark } from "@codesandbox/sandpack-themes";

export interface Props {
  code: Record<string, string>;
  dependencies: Record<string, string>;
  style?: CSSProperties;
  options?: SandpackInternal;
}

export const CodePreview: FC<Props> = (props) => {
  const { code, dependencies } = props;
  return (
    <div className="my-7">
      <Sandpack
        theme={dracula}
        options={{
          // editorHeight: 600,
          ...props.options,
        }}
        customSetup={{
          dependencies: {
            "@orderly.network/hooks": "1.0.4",

            axios: "latest",
            ...dependencies,
          },
        }}
        files={code}
        template="react"
      />
    </div>
  );
};
