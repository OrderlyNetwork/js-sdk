import { EMPTY_LIST, EMPTY_OBJECT } from "@orderly.network/types";
import { ModulesSection } from "@/components/api/module";
import { ApiLayout } from "@/components/layout/apiLayout";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";

export const getStaticProps = async (context) => {
  const parser = ParserServer.getInstance();

  // console.log("------", context);

  const slug = context.params.module;

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
  const parser = ParserServer.getInstance();
  const modules = parser.parser.modules;

  // return { paths: [], fallback: true };
  const paths: any[] = [];

  for (let index = 0; index < modules.length; index++) {
    const element = modules[index];

    paths.push({
      params: { module: element.name },
    });

    paths.push({
      params: { module: element.name },
    });
  }

  return {
    paths,
    fallback: true,
  };
}

export default function Module(props) {
  return (
    <ApiLayout data={props.categories || EMPTY_LIST}>
      {props.module ? (
        <ModulesSection
          module={props.module || EMPTY_OBJECT}
          paths={[props.module.slug]}
        />
      ) : (
        <div>Not Found</div>
      )}
    </ApiLayout>
  );
}
