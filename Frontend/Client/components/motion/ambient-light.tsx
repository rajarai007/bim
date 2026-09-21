/**
 * Fixed light layer behind the page: two soft brand-coloured light sources
 * that drift on their own and lean toward the pointer (MotionProvider writes
 * `--lx` / `--ly` on <html>), plus a fine paper grain. Pure CSS; see
 * `.ambient` in globals.css.
 */
export function AmbientLight() {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-grain" />
    </div>
  );
}
