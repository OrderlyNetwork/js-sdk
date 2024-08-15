export const XAxisLabel = (props: any) => {
  const { x, y, stroke, payload, index } = props;

  return (
    <g transform={`translate(${x},${y - 6})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fontSize={10}
        fill={"rgba(255,255,255,0.54)"}
      >
        {index === 0 ? payload.value : "Now"}
      </text>
    </g>
  );
};