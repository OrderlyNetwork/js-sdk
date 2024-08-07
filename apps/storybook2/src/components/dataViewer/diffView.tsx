import { useRef, useMemo } from "react";
import { Differ, Viewer } from "json-diff-kit";
import type { DiffResult } from "json-diff-kit";

import "json-diff-kit/dist/viewer.css";
import "./theme.css";

export const DiffView = (props: { data: any; hideUnchangedLines: boolean }) => {
  const prevData = useRef({});

  const differ = useRef(
    new Differ({
      detectCircular: true, // default `true`
      maxDepth: Infinity, // default `Infinity`
      showModifications: true, // default `true`
      arrayDiffMethod: "lcs", // default `"normal"`, but `"lcs"` may be more useful
    })
  );

  const diff = useMemo(() => {
    const _diff = differ.current.diff(prevData.current, props.data);

    prevData.current = props.data;

    return _diff;
  }, [props.data]);

  return (
    <InnerView
      diff={diff} // required
      hideUnchangedLines={props.hideUnchangedLines}
    />
  );
};
interface PageProps {
  diff: [DiffResult[], DiffResult[]];
  hideUnchangedLines: boolean;
}

const InnerView: React.FC<PageProps> = (props) => {
  return (
    <Viewer
      diff={props.diff} // required
      //   indent={2} // default `2`
      lineNumbers={true} // default `false`
      highlightInlineDiff={true} // default `false`
      inlineDiffOptions={{
        // mode: "word", // default `"char"`, but `"word"` may be more useful
        wordSeparator: " ", // default `""`, but `" "` is more useful for sentences
      }}
      hideUnchangedLines={props.hideUnchangedLines}
    />
  );
};
