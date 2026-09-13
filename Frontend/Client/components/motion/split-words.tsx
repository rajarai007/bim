import type { CSSProperties } from "react";
import { Fragment } from "react";

/**
 * Splits a heading into per-word spans so each word can rise out of its own
 * clip mask (`data-reveal="words"` in globals.css). Words stay in the
 * accessibility tree as normal text — only presentation is split.
 */
export function SplitWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? " " : null}
          <span className="word-mask">
            <span className="word" style={{ "--word-index": index } as CSSProperties}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}
