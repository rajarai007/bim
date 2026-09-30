import { AmbientFlow } from "@/components/motion/ambient-flow";

/**
 * Fixed layer behind the page. Far to near: three soft light sources (brand
 * orange, teal and an amber undertone) that drift on their own and lean toward
 * the pointer (MotionProvider writes `--lx` / `--ly` on this element), daylight
 * shafts that sway and travel with the scroll, silk ribbons and dust motes
 * (canvas) and a fine film grain. See `.ambient` in globals.css.
 */
export function AmbientLight() {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-violet" />
      <div className="ambient-rays" />
      <AmbientFlow />
      <div className="ambient-grain" />
    </div>
  );
}
