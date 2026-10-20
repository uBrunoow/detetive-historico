import type { Metadata } from "next";
import { OptionsForm } from "@/components/home/OptionsForm";
import { GameScreen } from "@/components/ui/GameScreen";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.optionsPage;
export const metadata: Metadata = { title: t.title };

export default function Options() {
  return (
    <GameScreen title={t.title} backLabel={t.back}>
      <p className="mt-4 max-w-xl text-lg">{t.intro}</p>
      <OptionsForm />
    </GameScreen>
  );
}
