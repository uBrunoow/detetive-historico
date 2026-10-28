import type { ReactNode } from "react";
import { NightSky } from "@/components/pixel/NightSky";
import { GameHud } from "./GameHud";

/** Moldura das telas: a noite do noir atrás, título pixel e botão de voltar. A tela abre em íris. */
export function GameScreen({
  title,
  backHref = "/",
  backLabel,
  hud,
  width = "stage",
  sky,
  children,
}: {
  title?: string;
  backHref?: string;
  backLabel?: string;
  hud?: ReactNode;
  width?: "stage" | "narrow" | "full";
  sky?: Parameters<typeof NightSky>[0];
  children: ReactNode;
}) {
  return (
    <main id="conteudo" className="game-world iris-open flex min-h-dvh flex-1 flex-col text-bone">
      <NightSky {...sky} />
      <div className={`relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pb-16 pt-5 sm:px-8 sm:pt-8 ${width === "full" ? "max-w-7xl" : width === "narrow" ? "max-w-3xl" : "max-w-6xl"}`}>
        {hud ?? (title && backLabel ? <GameHud backHref={backHref} backLabel={backLabel} title={title} /> : null)}
        {children}
      </div>
    </main>
  );
}
