import { ModulesSection } from "@/components/api/module";
import { ApiLayout } from "@/components/layout/apiLayout";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";

export const getStaticProps = async (context) => {
  const parser = ParserServer.getInstance();

  // console.log("------", context);

  const slug = context.params.module.replace(".zh-CN", "");

  // console.log("------", slug, decodeName(slug));

  const module = parser.parser.findByPath([decodeName(slug)]);

  return {
    props: {
      module: module ? module.toJSON() : null,
      categories: parser.getCategories(),
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [
      // Object variant:
      { params: { module: "123" }, locale: "zh-CN" },
      { params: { module: "123" }, locale: "en-US" },
    ],
    fallback: true,
  };
}

export default function Module(props) {
  console.log(props);
  return (
    <ApiLayout data={props.categories || []}>
      {props.module ? (
        <ModulesSection module={props.module || {}} />
      ) : (
        <div>Not Found</div>
      )}
    </ApiLayout>
  );
}
