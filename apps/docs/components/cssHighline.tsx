import { Highlight, themes } from "prism-react-renderer";

export const CSSCodeHighline = ({
  code,
  className,
}: {
  code: string;
  className?: string;
}) => {
  return (
    <Highlight theme={themes.oneDark} code={code} language="css">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={"p-3 rounded"}
          style={{ ...style, background: "transparent" }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
