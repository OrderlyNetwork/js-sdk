
interface IProps{
  children: React.ReactNode;
}
export default function TopBar(props: IProps) {
  return (
    <div
      className="top-toolbar oui-flex oui-h-[44px] oui-justify-start oui-items-center oui-px-3 oui-pt-3 oui-pb-[14px]">
      {props.children}
    </div>
  )
}