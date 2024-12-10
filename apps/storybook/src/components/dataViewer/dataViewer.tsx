import { ViewerToolbar } from "./toolbar";
import { DiffView } from "./diffView";
import { useState } from "react";

export const DataViewer = (props: { data: any }) => {
  const [diffViewProps, setDiffViewProps] = useState<{
    hideUnchangedLines: boolean;
  }>({
    // lineNumbers: true,
    // highlightInlineDiff: true,
    // inlineDiffOptions: {
    //   mode: 'char',
    //   wordSeparator: ' '
    // },
    hideUnchangedLines: true,
    // syntaxHighlight: {
    //   theme: 'monokai'
    // },
    // virtual: false
  });
  return (
    <div className="oui-bg-base-6 oui-rounded-md oui-p-2 oui-h-screen oui-overflow-auto">
      <h1 className="oui-font-semibold">Data Diff Viewer</h1>
      <ViewerToolbar
        hideUnchangedLines={diffViewProps.hideUnchangedLines}
        onToggleHideUnchangedLines={() => {
          setDiffViewProps((state) => ({
            ...state,
            hideUnchangedLines: !state.hideUnchangedLines,
          }));
        }}
      />
      <div className="oui-max-h-full">
        <DiffView data={props.data} {...diffViewProps} />
        {/* <pre>
          <code>{JSON.stringify(props.data, null, 2)}</code>
        </pre> */}
      </div>
    </div>
  );
};
