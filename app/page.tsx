import { HomeMenu } from "@/components/home/HomeMenu";
import { PixelBackdrop } from "@/components/home/PixelBackdrop";
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
    <main id="conteudo" className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden text-paper-0">
      <PixelBackdrop src="/art/title.png" alt={strings.home.sceneAlt}>
        {/* a única janela acesa do arquivo, que pisca de vez em quando */}
        <div className="title-window absolute bg-[#f0d9a0]" style={{ left: "39.7%", top: "46.5%", width: "6.3%", height: "13%" }} />
      </PixelBackdrop>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(20_26_43/0.92)_0%,rgb(20_26_43/0.72)_38%,transparent_70%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-10">
        <h1 className="px-title title-logo text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.95] text-[#f0d9a0]">
          Detetive
          <br />
          Histórico
        </h1>
        <p className="mt-5 max-w-sm text-lg text-paper-0/90 [text-shadow:2px_2px_0_rgb(0_0_0/0.6)]">{strings.home.tagline}</p>
        <div className="mt-10 w-full max-w-xs">
          <HomeMenu cases={refs} />
        </div>
      </div>
    </main>
  );
}
