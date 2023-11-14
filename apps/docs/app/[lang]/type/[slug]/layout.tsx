export async function generateStaticParams() {
  return [{ lang: "en-US" }, { lang: "zh-CN" }];
}

export default function Layout({ children }) {
  return <div>{children}</div>;
}
