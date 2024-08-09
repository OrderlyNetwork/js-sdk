export const ViewerToolbar = (props: {
  hideUnchangedLines: boolean;
  onToggleHideUnchangedLines: () => void;
}) => {
  const { hideUnchangedLines, onToggleHideUnchangedLines } = props;

  return (
    <div className="oui-flex oui-my-2 oui-text-sm">
      <div className="oui-flex oui-items-center oui-gap-x-1">
        <input
          type="checkbox"
          placeholder="Search"
          id="onlyDiff"
          checked={hideUnchangedLines}
          onChange={() => onToggleHideUnchangedLines()}
        />
        <label htmlFor="onlyDiff">Only changed</label>
      </div>
    </div>
  );
};
