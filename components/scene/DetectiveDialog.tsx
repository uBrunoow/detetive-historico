"use client";

import { useEffect, useState } from "react";
import { PixelSprite } from "@/components/pixel/PixelSprite";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true";

/**
 * A fala do detetive embaixo da cena, datilografada letra a letra. O leitor de tela recebe a
 * frase inteira de uma vez (aria-live); a digitação é só visual.
 */
export function DetectiveDialog({ text, emphasis }: { text: string; emphasis?: string }) {
  const full = emphasis ? `${text} ${emphasis}` : text;
  const [typed, setTyped] = useState({ full, shown: 0 });
  const shown = typed.full === full ? typed.shown : 0;

  useEffect(() => {
    let i = 0;
    let timer = 0;
    const instant = reducedMotion();
    const step = () => {
      i = instant ? full.length : i + 1;
      setTyped({ full, shown: i });
      if (i < full.length) timer = window.setTimeout(step, 18);
    };
    timer = window.setTimeout(step, 0);
    return () => window.clearTimeout(timer);
  }, [full]);

  const visible = full.slice(0, shown);
  const cut = text.length;
  return (
    <div className="flex items-center gap-4 bg-paper-0 px-4 py-3 text-ink px-frame">
      <PixelSprite name="face" className="w-12 shrink-0 sm:w-14" />
      <p className="min-h-[3em] flex-1 font-semibold leading-snug">
        <span className="sr-only" aria-live="polite">
          {full}
        </span>
        <span aria-hidden>
          {visible.slice(0, cut)}
          {visible.length > cut && <b className="text-stamp">{visible.slice(cut)}</b>}
          {shown < full.length && <span className="blink-slow ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-ink" />}
        </span>
      </p>
    </div>
  );
}
