"use client";

import { Form, Input } from "@douyinfe/semi-ui";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const search = useSearchParams();

  return (
    <div className={"p-3"}>
      <div className="uppercase">{search?.get("tag")}</div>
      <Form>
        <Form.Input
          label="Additional className"
          field="className"
          placeholder="bg-red-500"
        />
        <Form.Input label="Size" field="size" placeholder="button size" />
        <Form.Input label="Size" field="size_round" placeholder="round size" />
      </Form>
    </div>
  );
}
