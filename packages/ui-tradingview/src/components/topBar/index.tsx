
interface IProps{
  children: React.ReactNode;
}
export default function TopBar(props: IProps) {
  return (
    <div
      className="top-toolbar oui-flex oui-h-[44px] oui-justify-between md:oui-justify-start oui-items-center oui-p-2 md:oui-px-3 md:oui-pt-3 md:oui-pb-[14px]">
      {props.children}
    </div>
  )
}