"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type KeyboardEvent } from "react";
import { findContinueTarget } from "@/lib/progress/continue";
import { useHydrated } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

type CaseRef = { slug: string; title: string; startSceneId: string; sceneIds: string[] };

const t = strings.home;

/** Menu principal; setas para cima e para baixo também percorrem as opções. */
export function HomeMenu({ cases }: { cases: CaseRef[] }) {
  const hydrated = useHydrated();
  const target = useMemo(() => (hydrated ? findContinueTarget(cases) : null), [hydrated, cases]);

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>("a")];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = e.key === "ArrowDown" ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
    links[next]?.focus();
    e.preventDefault();
  }

  const items = [
    { href: "/fases", label: t.play, primary: true },
    ...(target ? [{ href: target.href, label: t.continue, sub: target.title }] : []),
    { href: "/como-jogar", label: t.howTo },
    { href: "/opcoes", label: t.options },
    { href: "/creditos", label: t.credits },
  ];

  return (
    <nav aria-label={t.menuLabel}>
      <ul onKeyDown={onKeyDown} className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-label={"sub" in item && item.sub ? strings.home.continueCase(item.sub) : undefined}
              className={`px-btn group w-full justify-start ${item.primary ? "" : "px-btn-paper"}`}
            >
              <Image
                src="/art/ui/lupa.png"
                alt=""
                width={24}
                height={24}
                unoptimized
                className="pixelated opacity-0 transition-opacity duration-75 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span className="flex flex-col items-start">
                {item.label}
                {"sub" in item && item.sub && (
                  <span className="mt-0.5 font-sans text-xs font-normal normal-case tracking-normal">{item.sub}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
