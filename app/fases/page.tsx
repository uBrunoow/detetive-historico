import type { Metadata } from "next";
import { CaseBoard } from "@/components/catalog/CaseBoard";
import { LevelCard } from "@/components/catalog/LevelCard";
import { GameScreen } from "@/components/ui/GameScreen";
import { listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

export const metadata: Metadata = { title: strings.levels.title };

export default async function Levels() {
  const cases = await listPublishedCases();
  return (
    <GameScreen title={strings.levels.title} backLabel={strings.levels.back} width="full" sky={{ moon: true, bats: true, flash: true }}>
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="max-w-xl text-lg text-mist">{strings.levels.intro}</p>
        <span className="bg-blood px-2 py-1 text-sm font-bold text-bone px-frame-flat">{strings.catalog.beta}</span>
      </div>
      {cases.length === 0 ? (
        <p className="mt-10">{strings.catalog.empty}</p>
      ) : (
        <>
        <CaseBoard cases={cases} />
        <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:hidden">
          {cases.map((c) => (
            <li key={c.slug}>
              <LevelCard c={c} />
            </li>
          ))}
        </ul>
        </>
      )}
    </GameScreen>
  );
}
