import { FunctionPage } from "@/components/api/function";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";

export const getStaticProps = async (context) => {
  const parser = ParserServer.getInstance();

  console.log("------", context);

  const moduleName = decodeName(context.params.module);

  const functionName = context.params.name.replace(".zh-CN", "");

  // const id = context.params.id.replace(".zh-CN", "");

  // console.log("------", id);

  const doc = parser.parser.findByPath([moduleName, functionName]);

  // console.log("----doc----", doc);

  return { props: { doc: doc?.toJSON() } };
};

export async function getStaticPaths() {
  return {
    paths: [
      // Object variant:
      // { params: { module: "123", name: "aa" }, locale: "zh-CN" },
    ],
    fallback: true,
  };
}

export default function InterfacePage(props) {
  console.log(props);
  return <FunctionPage doc={props.doc || {}} />;
}
