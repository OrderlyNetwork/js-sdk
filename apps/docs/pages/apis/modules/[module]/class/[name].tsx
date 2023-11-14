import { ClassPage } from "@/components/api/class";
import { ApiLayout } from "@/components/layout/apiLayout";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";

export const getStaticProps = async (context) => {
  const parser = ParserServer.getInstance();
  const moduleName = decodeName(context.params.module);

  const functionName = context.params.name.replace(".zh-CN", "");

  // const id = context.params.id.replace(".zh-CN", "");

  // console.log("------", id);

  const doc = parser.parser.findByPath([moduleName, functionName]);

  return { props: { doc: doc.toJSON(), categories: parser.getCategories() } };
};

export async function getStaticPaths() {
  return {
    paths: [
      // Object variant:
      { params: { module: "123", name: "aa" }, locale: "zh-CN" },
    ],
    fallback: true,
  };
}

export default function Page(props) {
  console.log(props);
  return (
    <ApiLayout data={props.categories}>
      <ClassPage doc={props.doc || {}} />
    </ApiLayout>
  );
}
