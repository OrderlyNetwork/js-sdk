import { Highlight, themes } from "prism-react-renderer";

export const CSSCodeHighline = ({ code }: { code: string }) => {
  return (
    <Highlight theme={themes.shadesOfPurple} code={code} language="css">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style}>
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
