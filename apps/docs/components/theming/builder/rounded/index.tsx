import { Form } from "@douyinfe/semi-ui";

export const RoundedEditor = () => {
  return (
    <div>
      <Form onValueChange={(values) => console.log(values)}>
        <Form.InputNumber
          field="rounded"
          placeholder={"default:6px"}
          label="rounded"
          suffix={"px"}
        />
        <Form.InputNumber
          field="roundedMd"
          placeholder={"default:14px"}
          label="rounded-md"
          suffix={"px"}
        />
        <Form.InputNumber
          field="roundedLg"
          placeholder={"default:14px"}
          label="rounded-lg"
          suffix={"px"}
        />
        <Form.InputNumber
          field="roundedXl"
          placeholder={"default:14px"}
          label="rounded-xl"
          suffix={"px"}
        />
      </Form>
    </div>
  );
};
