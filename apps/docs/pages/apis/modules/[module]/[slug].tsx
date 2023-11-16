import { ClassPage } from "@/components/api/class";
import { FunctionPage } from "@/components/api/function";
import { InterfacePage } from "@/components/api/interface";
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

  console.log("??????", doc?.type);

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
  const page = useMemo(() => {
    const type = props.type?.replace("Parser", "");

    switch (type) {
      case "Class":
        return <ClassPage doc={props.doc || {}} />;
      case "Interface":
        return <InterfacePage doc={props.doc || {}} />;
      case "Function":
        return <FunctionPage doc={props.doc || {}} />;
      // case 'Variable':
      //     return <ClassPage doc={props.doc || {}} />;
      default:
        return null;
    }
  }, [props.type]);
  return (
    <ApiLayout data={props.categories}>
      {/* <ClassPage doc={props.doc || {}} /> */}
      {page}
    </ApiLayout>
  );
}
