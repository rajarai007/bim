/**
 * Fixed light layer behind the page: three soft light sources (brand orange,
 * cyan and a violet undertone) that drift on their own and lean toward the
 * pointer (MotionProvider writes `--lx` / `--ly` on this element), plus a fine
 * film grain. Pure CSS; see `.ambient` in globals.css.
 */
export function AmbientLight() {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-violet" />
      <div className="ambient-grain" />
    </div>
  );
}
