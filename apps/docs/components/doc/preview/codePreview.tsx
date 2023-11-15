// import * as hookRaw from "./hook?raw";
import { Sandpack } from "@codesandbox/sandpack-react";

export interface Props {
  code: string;
}

export const CodePreview = () => {
  return (
    <div>
      <Sandpack
        customSetup={
          {
            // dependencies: {
            //   "@orderly.network/hooks": "latest",
            // },
          }
        }
        files={{
          "/App.js": `import { OrderlyConfigProvider } from "@orderly.network/hooks";

export default function Sample() {
  return (<><button type="primary">Button1</button>
      <button type="secondary">Button2</button></>
  );
}
`,
          "/node_modules/@orderly.network/hooks/package.json": {
            hidden: true,
            code: JSON.stringify({
              name: "@orderly.network/hooks",
              main: "./index.js",
            }),
          },
          // "/node_modules/@orderly.network/hooks/index.js": {
          //   hidden: true,
          //   code: hookRaw,
          // },
        }}
        template="react"
      />
    </div>
  );
};
