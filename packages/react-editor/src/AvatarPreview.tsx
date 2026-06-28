import React, { useRef, useEffect } from "react";
import { renderAvatar, type AvatarConfig } from "@retro-antlitz-kartei/generator";

export interface AvatarPreviewProps {
  /** The avatar to draw. */
  config: AvatarConfig;
  /** Backing canvas resolution in px. Default `320 × 400`. */
  width?: number;
  height?: number;
  /** Background: `true` = palette colour, hex string = override, `false` = transparent. */
  background?: boolean | string;
  /** Draw the floor strip. Default `true`. */
  floor?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Renders an {@link AvatarConfig} onto a `<canvas>`, re-drawing whenever the
 * config changes. Standalone — use it without the full editor chrome.
 */
export function AvatarPreview({
  config,
  width = 320,
  height = 400,
  background = true,
  floor = true,
  className,
  style,
  onClick,
}: AvatarPreviewProps): React.ReactElement {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    renderAvatar(canvas, config, { background, floor });
  }, [config, background, floor, width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={className}
      style={{ imageRendering: "pixelated", display: "block", ...style }}
      onClick={onClick}
    />
  );
}
