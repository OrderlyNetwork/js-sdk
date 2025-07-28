import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast, Toaster, ToastTile } from "@orderly.network/ui";

const meta: Meta<typeof Toaster> = {
  title: "Base/toast",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const toaster: Story = {
  render: (args) => {
    return (
      <>
        <div className="oui-flex oui-flex-col oui-gap-2">
          <button
            onClick={(e) => {
              toast.success(" success success  success success");
            }}
          >
            success
          </button>
          <button
            onClick={(e) => {
              toast.error("error error error error");
            }}
          >
            error
          </button>
          <button
            onClick={(e) => {
              toast.loading("loading loading loading loading");
            }}
          >
            loading
          </button>
          <button
            onClick={(e) => {
              toast.success(<ToastTile title="ADFD" subtitle="DFLKSDF" />);
            }}
          >
            success with subtitle
          </button>
          <button
            onClick={(e) => {
              toast.loading(<ToastTile title="ADFD" subtitle="DFLKSDF" />);
            }}
          >
            loading with subtitle
          </button>
          <button
            onClick={(e) => {
              toast.error(<ToastTile title="ADFD" subtitle="DFLKSDF" />);
            }}
          >
            error with subtitle
          </button>
        </div>
        <Toaster />
      </>
    );
  },
};

// box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.36);
