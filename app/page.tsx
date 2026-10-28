import Image from "next/image";
import { HomeMenu, HomeNav } from "@/components/home/HomeMenu";
import { NightSky } from "@/components/pixel/NightSky";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

export default async function Home() {
  const cases = await listPublishedCases();
  const refs = cases.map((c) => ({
    slug: c.slug,
    title: c.title,
    startSceneId: c.startSceneId,
    sceneIds: c.scenes.map((s) => s.id),
  }));

  return (
    <main id="conteudo" className="game-world iris-open relative flex min-h-dvh flex-1 flex-col text-bone">
      <NightSky moon bats flash />

      {/* A rua do arquivo: o detetive espera sob o poste, ao lado da única janela acesa. */}
      <div role="img" aria-label={strings.home.sceneAlt} className="pointer-events-none absolute inset-x-0 bottom-8 -z-10 h-[min(62vh,36rem)]">
        <PixelSprite name="pines" className="absolute bottom-0 left-0 w-[46%] max-w-xl" />
        <PixelSprite name="archive" className="absolute bottom-0 right-[1%] w-[min(40vw,30rem)]" />
        <div className="lamp-cone absolute bottom-0 left-[54%] hidden h-[78%] w-[16vw] -translate-x-1/2 sm:block" />
        <div className="lamp-glow absolute left-[54%] top-[6%] hidden aspect-square w-[34vw] max-w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full sm:block" />
        <PixelSprite name="lamp" className="absolute bottom-0 left-[54%] hidden h-[86%] w-auto -translate-x-1/2 sm:block" />
        <PixelSprite name="detective" className="sprite-breathe absolute bottom-0 left-[44%] w-[min(30vw,15rem)] sm:left-[60%] sm:w-[min(22vw,15rem)]" />
      </div>

      {/* Topo, como no mockup: menu à esquerda, as três lupas de dica à direita. */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 pt-6 sm:px-10">
        <HomeNav />
        <span className="hidden gap-2 sm:flex" role="img" aria-label={strings.home.hints}>
          {[0, 1, 2].map((i) => (
            <Image key={i} src="/art/ui/lupa.png" alt="" width={40} height={40} unoptimized className="pixelated drop-shadow-[0_0_8px_rgb(232_169_58/0.45)]" />
          ))}
        </span>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-48 pt-6 sm:px-10 lg:pb-24">
        <h1 className="title-gothic text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.86]">
          <span className="block">Detetive</span>
          <span className="title-flicker block">Histórico</span>
        </h1>
        <p className="mt-6 max-w-md text-lg font-semibold text-mist">{strings.home.tagline}</p>
        <div className="mt-8">
          <HomeMenu cases={refs} />
        </div>
      </div>
    </main>
  );
}
