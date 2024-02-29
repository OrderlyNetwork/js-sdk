import { useEffect, useRef, useState } from "react";
import { mergeDeepRight } from "ramda";
import { PosterPainter } from "./services/painter/painter";
import { type drawOptions } from "./services/painter/basePaint";
import { defaultLayoutConfig } from "./services/painter/layout.config";

export { type drawOptions } from "./services/painter/basePaint";

/**
 * Generates a poster image based on position information. You can set the size, background color, font color, font size, and content position of the poster.
 * @returns
 */
export const usePoster = (
  /**
   * The canvas element to draw the poster on
   */
  trage: HTMLCanvasElement,
  /**
   * The options to draw the poster
   */
  options: drawOptions
) => {
  const [error, setError] = useState<Error | null>(null);
  const painterRef = useRef<PosterPainter | null>(null);
  useEffect(() => {
    // Create the painter instance
    if (trage && !painterRef.current) {
      painterRef.current = new PosterPainter(trage);
      painterRef.current.draw(
        mergeDeepRight({ layout: defaultLayoutConfig }, options)
      );
    }
  }, [trage]);

  useEffect(() => {
    if (painterRef.current) {
      painterRef.current.draw(
        mergeDeepRight({ layout: defaultLayoutConfig }, options)
      );
    }
  }, [options]);

  //   const draw = (dataSource: any) => {};

  //   const clear = () => {};

  const toDataURL = (
    /**
     * The image MIME type
     */
    type = "image/png",
    /**
     * The quality of the image
     */
    encoderOptions = 1.0
  ) => {
    return trage.toDataURL(type, encoderOptions);
  };

  return {
    error,
    /**
     * Converts the poster to a data URL
     */
    toDataURL,
  } as const;
};
