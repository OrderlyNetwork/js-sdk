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

        {/*<Form.Select field="Role" label={{ text: '角色', optional: true }} style={{ width: 176 }}>*/}
        {/*  <Option value="admin">管理员</Option>*/}
        {/*  <Option value="user">普通用户</Option>*/}
        {/*  <Option value="guest">访客</Option>*/}
        {/*</Form.Select>*/}
      </Form>
    </div>
  );
};
