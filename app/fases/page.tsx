import type { Metadata } from "next";
import { LevelCard } from "@/components/catalog/LevelCard";
import { GameScreen } from "@/components/ui/GameScreen";
import { listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

export const metadata: Metadata = { title: strings.levels.title };

export default async function Levels() {
  const cases = await listPublishedCases();
  return (
    <GameScreen title={strings.levels.title} backLabel={strings.levels.back}>
      <p className="mt-4 max-w-xl text-lg">{strings.levels.intro}</p>
      {cases.length === 0 ? (
        <p className="mt-10">{strings.catalog.empty}</p>
      ) : (
        <ul className="mt-14 grid gap-14 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.slug}>
              <LevelCard c={c} />
            </li>
          ))}
        </ul>
      )}
    </GameScreen>
  );
}
