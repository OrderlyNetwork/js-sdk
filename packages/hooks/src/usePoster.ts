import { useCallback, useEffect, useRef, useState } from "react";
import { mergeDeepRight } from "ramda";
import { PosterPainter } from "./services/painter/painter";
import { type drawOptions } from "./services/painter/basePaint";
import { defaultLayoutConfig } from "./services/painter/layout.config";
import { SDKError } from "@orderly.network/types";

export { type drawOptions } from "./services/painter/basePaint";

/**
 * Generates a poster image based on position information. You can set the size, background color, font color, font size, and content position of the poster.
 * @example
 * ```tsx
 * const { ref, toDataURL, toBlob, download, copy } = usePoster({
 *  backgroundColor: "#0b8c70",
 * backgroundImg: "/images/poster_bg.png",
 * color: "rgba(255, 255, 255, 0.98)",
 * profitColor: "rgb(0,181,159)",
 * ...
 * });
 */
export const usePoster = (
  /**
   * The options to draw the poster
   */
  options: drawOptions
) => {
  const [error, setError] = useState<Error | null>(null);
  const [canCopy, setCanCopy] = useState<boolean>(
    () => typeof navigator.clipboard !== "undefined"
  );

  const painterRef = useRef<PosterPainter | null>(null);

  const [target, setTarget] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Create the painter instance
    if (target && !painterRef.current) {
      painterRef.current = new PosterPainter(target);
      painterRef.current.draw(
        mergeDeepRight<Partial<drawOptions>, drawOptions>(
          { layout: defaultLayoutConfig, fontFamily: "Manrope" },
          options
        )
      );
    }
  }, [target]);

  useEffect(() => {
    if (painterRef.current) {
      painterRef.current.draw(
        mergeDeepRight({ layout: defaultLayoutConfig }, options)
      );
    }
  }, [options]);

  const toDataURL = (type?: string, encoderOptions?: number) => {
    if (!target) {
      throw new SDKError("The ref must be a canvas element");
    }
    return target.toDataURL(type, encoderOptions);
  };

  /**
   * Converts the poster to a blob
   */
  const toBlob = useCallback(
    (type?: string, encoderOptions?: number): Promise<Blob | null> => {
      return new Promise<Blob | null>((resolve) => {
        if (!target) {
          resolve(null);
          return;
        }
        target.toBlob(resolve, type, encoderOptions);
      });
    },
    [target]
  );

  const ref = (ref: HTMLCanvasElement | null) => {
    if (!ref) return;
    if (ref.tagName.toUpperCase() !== "CANVAS") {
      // throw new Error("The ref must be a canvas element");
      setError(new SDKError("The ref must be a canvas element"));
      return;
    }
    setTarget(ref);
  };

  const download = useCallback(
    (filename: string, type: string = "image/png", encoderOptions?: number) => {
      if (!target) {
        throw new SDKError("The ref must be a canvas element");
      }
      const img = new Image();
      img.src = target.toDataURL(type, encoderOptions);
      const link = document.createElement("a");
      link.href = img.src;
      link.download = filename;
      link.click();
    },
    [target]
  );

  const copy = useCallback(() => {
    if (!target) {
      throw new SDKError("The ref must be a canvas element");
    }
    // copy image to clipboard
    return new Promise<void>((resolve, reject) => {
      if (!navigator.clipboard) {
        reject(new SDKError("Clipboard API is not supported"));
        return;
      }
      target.toBlob((blob) => {
        if (!blob) {
          reject(new SDKError("Failed to create blob"));
          return;
        }
        return navigator.clipboard
          .write([new ClipboardItem({ [blob.type]: blob })])
          .then(resolve, reject);
      });
    });
  }, [target]);

  return {
    error,
    ref,
    /**
     * Converts the poster to a data URL
     */
    toDataURL,
    /**
     * Converts the poster to a blob
     */
    toBlob,
    /**
     * Downloads the poster as an image
     */
    download,
    /**
     * Browser if supports copy image to clipboard
     */
    canCopy,
    copy,
  } as const;
};
