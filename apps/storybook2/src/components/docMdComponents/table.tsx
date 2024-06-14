import { PropsWithChildren } from "react";

const PropsTable = (props: PropsWithChildren) => {
  return (
    <table className={"oui-w-full"}>
      <thead>
        <tr>
          <th>Class name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>{props.children}</tbody>
    </table>
  );
};

const PropsRow = (props: { name: string; value: string }) => {
  return (
    <tr>
      <td>{props.name}</td>
      <td>{props.value}</td>
    </tr>
  );
};

export { PropsTable, PropsRow };
