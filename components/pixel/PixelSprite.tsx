import { SPRITE_LIGHTS, SPRITES, toRects, type SpriteName } from "@/lib/pixel/sprites";

/** Um sprite do noir desenhado em SVG nítido; decorativo, a não ser que receba `label`. */
export function PixelSprite({ name, className = "", label }: { name: SpriteName; className?: string; label?: string }) {
  const rows = SPRITES[name];
  const w = Math.max(...rows.map((r) => r.length));
  const lights = SPRITE_LIGHTS[name] ?? [];
  return (
    <svg
      viewBox={`0 0 ${w} ${rows.length}`}
      shapeRendering="crispEdges"
      className={`block ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {toRects(rows).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
      {lights.map((l) => (
        <rect key={`l${l.x}-${l.y}`} className="win-flicker" x={l.x} y={l.y} width={l.w} height={l.h} fill={l.color} style={{ animationDelay: `${l.delay}s` }} />
      ))}
    </svg>
  );
}
