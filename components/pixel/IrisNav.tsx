"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true";

/**
 * Troca de tela como no cinema mudo: ao clicar num link interno, a íris fecha a partir do
 * ponto clicado e só então a página muda (a nova tela abre com `.iris-open`).
 * Cliques com Ctrl/Cmd/Shift, links externos, âncoras e downloads seguem o normal.
 */
export function IrisNav() {
  const router = useRouter();
  const [closing, setClosing] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (reducedMotion()) return;
      // Captura antes do <Link>: a navegação acontece depois que a íris fecha.
      e.preventDefault();
      e.stopPropagation();
      const x = e.clientX || a.getBoundingClientRect().left + a.offsetWidth / 2;
      const y = e.clientY || a.getBoundingClientRect().top + a.offsetHeight / 2;
      setClosing({ x: (x / innerWidth) * 100, y: (y / innerHeight) * 100 });
      setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
        setTimeout(() => setClosing(null), 400);
      }, 320);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  if (!closing) return null;
  return <div aria-hidden className="iris-close" style={{ "--ix": `${closing.x}%`, "--iy": `${closing.y}%` } as CSSProperties} />;
}
