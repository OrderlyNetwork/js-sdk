import React, { useEffect, useMemo, useRef, useState } from "react";

export interface AudioPlayerOptions {
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export const useAudioPlayer = (
  src: string,
  options: AudioPlayerOptions = {},
) => {
  const { volume = 1, loop, autoPlay } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<
    "idle" | "play" | "playing" | "paused" | "ended" | "error"
  >("idle");

  const onPlay = () => {
    setStatus("play");
  };

  const onPlaying = () => {
    setStatus("playing");
  };

  const onPause = () => {
    setStatus("paused");
  };

  const onEnded = () => {
    setStatus("ended");
  };

  const onError = () => {
    setStatus("error");
  };

  const element = useMemo(() => {
    return React.createElement("audio", {
      controls: false,
      ref: audioRef,
      autoPlay: autoPlay,
      src: src,
      style: { display: "none" },
      onPlay: onPlay,
      onPlaying: onPlaying,
      onPause: onPause,
      onEnded: onEnded,
      onError: onError,
    });
  }, [autoPlay, src, onPlay, onPlaying, onPause, onEnded, onError]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) {
      return;
    }
    el.loop = loop ?? false;
    el.volume = Math.max(0, Math.min(1, volume));
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [loop, volume]);

  return [element, audioRef, status] as const;
};
