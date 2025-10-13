import { Text } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

const { numeral: Numeral } = Text;

const meta = {
  title: "Base/Typography/Numeral",
  component: Numeral,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: [
        "3xs",
        "2xs",
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
      ],
    },
    color: {
      control: {
        type: "inline-radio",
      },
      options: [
        "primary",
        "secondary",
        "tertiary",
        "warning",
        "danger",
        "success",
        "buy",
        "sell",
        "neutral",
        "profit",
        "lose",
      ],
    },
  },
  args: {
    size: "base",
    weight: "regular",
    color: "primary",
    coloring: true,
    rule: "price",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 2323.023,
    rule: "price",
    dp: 4,
  },
};

export const Percentages: Story = {
  args: {
    children: 0.233423,
    dp: 4,
    rule: "percentages",
  },
};

export const RemovePadding: Story = {
  args: {
    children: 450.0,
    dp: 0,
    padding: false,
  },
};

export const RoundingMode: Story = {
  render: (args) => {
    return (
      <div>
        <Text>Origin value: 2343542.23347323</Text>
        <table className="oui-w-[400px] oui-border">
          <thead>
            <tr>
              <th>Mode</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>truncate</td>
              <td>truncate</td>
              <td>
                <Numeral {...args} dp={4} rm={"truncate"} />
              </td>
            </tr>
            {[
              "ROUND_UP",
              "ROUND_DOWN",
              "ROUND_CEIL",
              "ROUND_FLOOR",
              "ROUND_HALF_UP",
              "ROUND_HALF_DOWN",
              "ROUND_HALF_EVEN",
              "ROUND_HALF_CEIL",
              "ROUND_HALF_FLOOR",
            ].map((mode, index) => {
              return (
                <tr key={mode}>
                  <td>{mode}</td>
                  <td>{index}</td>
                  <td>
                    <Numeral {...args} dp={4} rm={index} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
  args: {
    children: 2343542.23347323,
  },
};
