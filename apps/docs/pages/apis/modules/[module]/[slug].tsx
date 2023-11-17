import { ClassPage } from "@/components/api/class";
import { DetailsPageProvider } from "@/components/api/detailPageProvider";
import { FunctionPage } from "@/components/api/function";
import { InterfacePage } from "@/components/api/interface";
import { ModulesSection } from "@/components/api/module";
import { VariablePage } from "@/components/api/variable/index.page";
import { ApiLayout } from "@/components/layout/apiLayout";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";
import { useMemo } from "react";

export const getStaticProps = async (context) => {
  console.log("------", context);

  const parser = ParserServer.getInstance();
  const moduleName = decodeName(context.params.module);

  const functionName = context.params.slug.replace(`.${context.locale}`, "");

  const doc = parser.parser.findByPath([moduleName, functionName]);

  return {
    props: {
      doc: doc ? doc.result.toJSON() : [],
      type: doc?.type ?? "",
      categories: parser.getCategories(),
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [
      // Object variant:
      { params: { module: "123", slug: "aa" }, locale: "zh-CN" },
    ],
    fallback: true,
  };
}

export default function Page(props) {
  console.log(props);

  const type = useMemo(() => {
    return props.type?.replace("Parser", "");
  }, [props.type]);

  const page = useMemo(() => {
    // const type = props.type?.replace("Parser", "");

    switch (type) {
      case "Class":
        return <ClassPage doc={props.doc || {}} />;
      case "Interface":
        return <InterfacePage doc={props.doc || {}} />;
      case "Function":
        return <FunctionPage doc={props.doc || {}} />;
      case "Variable":
        return <VariablePage doc={props.doc || {}} />;
      case "Namespace":
        return <ModulesSection module={props.doc || {}} />;
      default:
        return null;
    }
  }, [type]);
  return (
    <DetailsPageProvider slug={""} type={type}>
      <ApiLayout data={props.categories}>{page}</ApiLayout>
    </DetailsPageProvider>
  );
}
