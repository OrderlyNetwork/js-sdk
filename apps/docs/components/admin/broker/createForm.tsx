import { Button, Form } from "@douyinfe/semi-ui";
import { FC } from "react";

interface Props {
  onSubmit: (values: any) => void;
}

export const CreateBrokerForm: FC<Props> = (props) => {
  return (
    <div>
      <Form
        onSubmit={(values) => {
          // console.log(values);
          props.onSubmit(values);
        }}
      >
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
    </div>
  );
};
