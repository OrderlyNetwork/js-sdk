//@ts-ignore
import QRious from "qrious";

export const qrPaint = (
  ctx: CanvasRenderingContext2D,
  options: {
    size: number;
    left: number;
    top: number;
    data: string;
  }
) => {
  const { size, left, top, data } = options;

  console.log("qrPaint", options);

  const qr = new QRious({
    value: data,
    // size: 112,
    padding: 6,
    // level: "H",
  });

  ctx.drawImage(qr.canvas, left, top, size, size);
};
