"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { findContinueTarget } from "@/lib/progress/continue";
import { useHydrated } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

type CaseRef = { slug: string; title: string; startSceneId: string; sceneIds: string[] };

const t = strings.home;

/** Ação da tela de título, como no mockup: "Começar investigação" e "aperte Enter" (que funciona). */
export function HomeMenu({ cases }: { cases: CaseRef[] }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const target = useMemo(() => (hydrated ? findContinueTarget(cases) : null), [hydrated, cases]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Só quando nada tem foco: Enter num link ou botão segue o comportamento normal.
      if (e.key !== "Enter" || (document.activeElement && document.activeElement !== document.body)) return;
      router.push("/fases");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
      <Link href="/fases" className="px-btn px-btn-ink px-btn-call text-3xl">
        {t.start}
      </Link>
      {target && (
        <Link href={target.href} aria-label={t.continueCase(target.title)} className="px-btn px-btn-paper text-xl">
          {t.continue}
        </Link>
      )}
      <span aria-hidden className="blink-slow font-pixel text-2xl text-mist">
        {t.pressStart}
      </span>
    </div>
  );
}

/** Links do topo da tela de título; setas para os lados também andam entre eles. */
export function HomeNav() {
  const items = [
    { href: "/fases", label: t.play },
    { href: "/como-jogar", label: t.howTo },
    { href: "/opcoes", label: t.options },
    { href: "/creditos", label: t.credits },
  ];
  return (
    <nav aria-label={t.menuLabel}>
      <ul className="flex flex-wrap gap-x-7 gap-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-pixel text-2xl text-bone decoration-[3px] underline-offset-[6px] hover:text-amber-hi hover:underline sm:text-3xl"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
