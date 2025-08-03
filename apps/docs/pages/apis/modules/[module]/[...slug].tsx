import { useMemo } from "react";
import { useRouter } from "next/router";
import { EMPTY_OBJECT } from "@orderly.network/types";
import { ClassPage } from "@/components/api/class";
import { DetailsPageProvider } from "@/components/api/detailPageProvider";
import { EnumPage } from "@/components/api/enum";
import { FunctionPage } from "@/components/api/function";
import { InterfacePage } from "@/components/api/interface";
import { ModulesSection } from "@/components/api/module";
import { TypeAliasPage } from "@/components/api/typeAlias";
import { VariablePage } from "@/components/api/variable/index.page";
import { ApiLayout } from "@/components/layout/apiLayout";
import { decodeName } from "@/helper/typedocParser/name";
import { ParserServer } from "@/helper/typedocParser/parserServer";

export const getStaticProps = async (context) => {
  // console.log("---context---", context);

  const parser = ParserServer.getInstance();
  const moduleName = decodeName(context.params.module);

  const functionName = context.params.slug;

  const doc = parser.parser.findByPath([moduleName, functionName]);

  return {
    props: {
      doc: doc ? doc.result.toJSON() : [],
      type: doc?.type ?? "",
      moduleName,
      categories: parser.getCategories(),
    },
  };
};

export async function getStaticPaths() {
  const parser = ParserServer.getInstance();
  const modules = parser.parser.modules;

  const paths: any[] = [];

  function generatePaths(module: any, parentPath: string[] = []) {
    for (let index = 0; index < module.classes.length; index++) {
      const element = module.classes[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });
    }

    for (let index = 0; index < module.namespaces.length; index++) {
      const element = module.namespaces[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });

      generatePaths(element, [...parentPath, element.name]);
    }

    for (let index = 0; index < module.interfaces.length; index++) {
      const element = module.interfaces[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });
    }
    for (let index = 0; index < module.functions.length; index++) {
      const element = module.functions[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });
    }
    for (let index = 0; index < module.variables.length; index++) {
      const element = module.variables[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });
    }
    for (let index = 0; index < module.namespaces.length; index++) {
      const element = module.namespaces[index];
      paths.push({
        params: { module: module.name, slug: [...parentPath, element.name] },
      });
    }

    for (let index = 0; index < module.enums.length; index++) {
      const element = module.enums[index];
      paths.push({
        params: { module: module.name, slug: [element.name] },
      });
    }

    for (let index = 0; index < module.typeAliases.length; index++) {
      const element = module.typeAliases[index];
      paths.push({
        params: { module: module.name, slug: [element.name] },
      });
    }
  }

  for (let index = 0; index < modules.length; index++) {
    const module = modules[index];

    generatePaths(module);
  }

  // return { paths: [], fallback: true };

  return {
    paths,
    fallback: true,
  };
}

export default function Page(props) {
  const router = useRouter();

  // console.log("---api detail page---", props);

  const type = useMemo(() => {
    return props.type?.replace("Parser", "");
  }, [props.type]);

  const page = useMemo(() => {
    switch (type) {
      case "Class":
        return <ClassPage doc={props.doc || EMPTY_OBJECT} />;
      case "Interface":
        return <InterfacePage doc={props.doc || EMPTY_OBJECT} />;
      case "Function":
        return <FunctionPage doc={props.doc || EMPTY_OBJECT} />;
      case "Variable":
        return <VariablePage doc={props.doc || EMPTY_OBJECT} />;
      case "TypeAlias":
        return <TypeAliasPage doc={props.doc || EMPTY_OBJECT} />;
      case "Namespace":
        return (
          <ModulesSection
            module={props.doc || EMPTY_OBJECT}
            paths={[router.query.module as string, props.doc?.name]}
          />
        );
      case "Enum":
        return <EnumPage doc={props.doc || EMPTY_OBJECT} />;
      default:
        return null;
    }
  }, [type, props.doc, router.query.module]);

  return (
    <DetailsPageProvider
      slug={router.query.module as string}
      type={type}
      moduleName={props.moduleName}
      apiName={props.doc?.name}
    >
      <ApiLayout data={props.categories}>{page}</ApiLayout>
    </DetailsPageProvider>
  );
}
