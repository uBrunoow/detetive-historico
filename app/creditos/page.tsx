import type { Metadata } from "next";
import { GameScreen } from "@/components/ui/GameScreen";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.creditsPage;
export const metadata: Metadata = { title: t.title };

export default function Credits() {
  return (
    <GameScreen title={t.title} backLabel={t.back}>
      <div className="mt-10 max-w-2xl space-y-4 bg-paper-0 p-6 text-ink px-frame sm:p-8">
        <p className="text-lg">{t.project}</p>
        <p>{t.institution}</p>
        <p className="border-t-2 border-dashed border-paper-3 pt-4">{t.fictional}</p>
        <p>{t.art}</p>
        <p>{t.fonts}</p>
      </div>
    </GameScreen>
  );
}
