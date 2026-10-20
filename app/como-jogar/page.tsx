import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GameScreen } from "@/components/ui/GameScreen";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.howToPage;
export const metadata: Metadata = { title: t.title };

export default function HowTo() {
  return (
    <GameScreen title={t.title} backLabel={t.back}>
      <ol className="mt-10 grid gap-8 md:grid-cols-2">
        {t.steps.map((step, i) => (
          <li key={step.title} className="flex gap-5 bg-paper-0 p-5 text-ink px-frame">
            <Image src={`/art/ui/${step.icon}.png`} alt="" width={64} height={64} unoptimized className="pixelated size-16 shrink-0" />
            <div>
              <h2 className="font-pixel text-xl font-semibold">
                <span className="text-stamp">{i + 1}.</span> {step.title}
              </h2>
              <p className="mt-2 max-w-prose">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/fases" className="px-btn mt-12">
        {t.play}
      </Link>
    </GameScreen>
  );
}
