import { Button, Form, Tooltip } from "@douyinfe/semi-ui";
import { FC } from "react";

interface Props {
  onSubmit: (values: any) => void;
}

export const SectionBase: FC<Props> = (props) => {
  return (
    <Form
      initValues={{
        brokerId: "b4ce92f5-23a4-47cf-b726-83b39ff95b85",
      }}
      onSubmit={(values) => {
        // console.log(values);
        props.onSubmit(values);
      }}
    >
      <Form.Input
        field={"brokerId"}
        defaultValue={"55f1225a-363c-4e1b-9a5f-3682c37a234d"}
      />
      <Form.Input
        field="name"
        label="Theme Name"
        rules={[
          {
            required: true,
          },
        ]}
      />
      <Form.TextArea
        field="description"
        label={{
          text: "Description",
        }}
      />

      <Button htmlType="submit">Next</Button>
    </Form>
  );
};
