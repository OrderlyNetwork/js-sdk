import { Form } from "@douyinfe/semi-ui";

export const SpacingEditor = () => {
  return (
    <div>
      <Form onValueChange={(values) => console.log(values)}>
        <Form.InputNumber
          field="rounded"
          placeholder={"default:8px"}
          label="spacing-base"
          suffix={"px"}
        />
      </Form>
    </div>
  );
};
