import { Form } from "@douyinfe/semi-ui";

export const TypographyEditor = () => {
  return (
    <div>
      <Form layout="horizontal" onValueChange={(values) => console.log(values)}>
        <Form.InputNumber
          field="baseFontSize"
          placeholder={"default:14px"}
          label="Base font size"
        />
      </Form>
    </div>
  );
};
