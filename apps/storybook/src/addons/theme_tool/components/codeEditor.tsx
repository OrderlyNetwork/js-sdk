import { SyntaxHighlighter } from "@storybook/components";
import { styled } from "@storybook/theming";
import { useContext, useMemo } from "react";
import { EditorContext } from "./editorContext";

export function hexToRgb(hex: string) {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    console.error("Invalid HEX color format");
    return null;
  }

  let color = hex.substring(1);

  if (color.length === 3) {
    color = color
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // return [r, g, b];

  return `${r} ${g} ${b}`;
}

export function isColorValue(value: string) {
  return (
    value.startsWith("--oui-color") ||
    (value.startsWith("--oui-gradient") &&
      !["stop-start", "stop-end", "angle"].some((item) => value.endsWith(item)))
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Content = styled.div`
  padding: 20px;
  // background: #f5f5f5;
`;

export const CodeEditor = () => {
  const { theme } = useContext(EditorContext);
  const code = useMemo(() => {
    console.log(theme);

    const newTheme: Record<string, string> = {};

    for (const [key, value] of Object.entries(theme)) {
      console.log(key, value);

      if (value === "") continue;

      let val = value;

      if (isColorValue(key)) {
        val = hexToRgb(value) ?? "";
      }

      newTheme[key] = val;
    }

    let code = JSON.stringify(newTheme, null, 2);
    code = code.replace("{", "").replace("}", "");
    code = code.replace(/"/g, "");
    code = code.replace(/,(?=\s*$)/gm, ";");
    code = code.replace(/\\/g, '"');

    return code;
  }, [theme]);

  return (
    <Content>
      <Container>
        <SyntaxHighlighter copyable language="css">
          {code}
        </SyntaxHighlighter>
      </Container>
    </Content>
  );
};
