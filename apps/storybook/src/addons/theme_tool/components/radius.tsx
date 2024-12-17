import { styled } from "@storybook/theming";
import { useContext } from "react";
import EditorContext from "./editorContext";

export const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const StyledGroupName = styled.h3`
  font-size: 14px;
  color: #999;
  font-weight: 700;
`;

const RADIUS_SIZES = ["sm", "md", "lg", "xl", "2xl", "full"] as const;

export const Radius = () => {
  const { theme, setTheme } = useContext(EditorContext);
  const handleChange = (name: string) => (value: string) => {
    setTheme((prev: any) => ({ ...prev, [name]: value }), {
      [name]: value,
    });
  };

  return (
    <div>
      <StyledGroupName>Border Radius</StyledGroupName>
      <Wrap>
        {RADIUS_SIZES.map((size) => (
          <RadiusInput
            key={size}
            name={size}
            value={theme[`--oui-rounded-${size}`]}
            onChange={handleChange(`--oui-rounded-${size}`)}
          />
        ))}
      </Wrap>
    </div>
  );
};

export const Label = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
`;

export const StyledInput = styled.input`
  width: 100%;
  border: 1px solid #aaa;
  background: transparent;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 12px;
`;

const RadiusInput = ({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div>
      <Label>{name}</Label>
      <div>
        <StyledInput
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
};
