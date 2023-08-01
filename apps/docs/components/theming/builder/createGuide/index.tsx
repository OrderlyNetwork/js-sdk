"use client";

import { FC, useMemo, useState } from "react";
import { Button, Layout, Steps } from "@douyinfe/semi-ui";
import { SectionBase } from "./sectionBase";
import { trpc } from "@/utils/trpc";

export const CreateThemeGuide: FC = () => {
  const createTheme = trpc.theme.add.useMutation();
  const [step, setStep] = useState(0);

  const onSubmit = (values: any) => {
    createTheme.mutate(values);
  };

  const content = useMemo(() => {
    switch (step) {
      case 0:
        return <SectionBase onSubmit={onSubmit} />;
      default:
        return null;
    }
  }, [step]);

  return (
    <Layout>
      <Layout>
        <Layout.Sider style={{ width: 300 }}>
          <Steps
            direction="vertical"
            current={step}
            onChange={(i) => console.log(i)}
          >
            <Steps.Step title="Base" description="This is a description" />
            <Steps.Step
              title="In Progress"
              description="This is a description"
            />
            <Steps.Step title="Waiting" description="This is a description" />
          </Steps>
        </Layout.Sider>
        <Layout.Content>{content}</Layout.Content>
      </Layout>
      <Layout.Footer>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setStep(step - 1)}>Prev</Button>
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        </div>
      </Layout.Footer>
    </Layout>
  );
};
