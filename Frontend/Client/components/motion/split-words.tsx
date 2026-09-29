import type { CSSProperties } from "react";
import { Fragment } from "react";

/**
 * Splits a heading into per-word spans so each word can rise out of its own
 * clip mask (`data-reveal="words"` in globals.css). Words stay in the
 * accessibility tree as normal text — only presentation is split.
 * `offset` continues the stagger when a heading is split across two calls
 * (e.g. a plain phrase followed by a gradient one).
 */
export function SplitWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? " " : null}
          <span className="word-mask">
            <span className="word" style={{ "--word-index": offset + index } as CSSProperties}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}
