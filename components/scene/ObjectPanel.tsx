"use client";

import { DocumentSheet } from "@/components/document/DocumentSheet";
import { Button } from "@/components/ui/Button";
import type { SceneObject } from "@/lib/content/schema";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.viewer;

type Props = { object: SceneObject; locked: boolean; onClose: () => void; titleId: string };

/** Conteúdo de objetos que não são evidência: leitura, contexto, decorativo, trancado. */
export function ObjectPanel({ object, locked, onClose, titleId }: Props) {
  const c = object.content;

  if (locked) {
    return (
      <div className="bg-paper-0 px-6 py-7 sm:px-8">
        <p className="font-pixel text-sm font-bold text-ribbon">{t.lockedTitle}</p>
        <h2 id={titleId} className="mt-1 font-pixel text-xl font-bold">
          {object.label}
        </h2>
        <p className="mt-3 max-w-prose">{object.unlock?.lockedMessage}</p>
        <Button variant="secondary" className="mt-6" onClick={onClose}>
          {t.close}
        </Button>
      </div>
    );
  }

  const isReading = object.type === "reading" || Boolean(c?.presentation);
  return (
    <div className={isReading ? "grid md:grid-cols-[minmax(0,1.25fr)_minmax(16rem,1fr)]" : ""}>
      {isReading && c?.transcription && (
        <div className="doc-shadow-desk px-4 py-8 sm:px-8">
          <DocumentSheet presentation={c.presentation ?? { style: "typed" }} transcription={c.transcription} />
        </div>
      )}
      <div className="flex flex-col bg-paper-0 px-6 py-7 sm:px-8">
        <p className="font-pixel text-sm font-bold text-stamp">{isReading ? t.reading : t.observation}</p>
        <h2 id={titleId} className="mt-1 font-pixel text-xl font-bold">
          {c?.title ?? object.label}
        </h2>
        <p className="mt-3 max-w-prose">{c?.text}</p>
        <Button variant="secondary" className="mt-6 self-start" onClick={onClose}>
          {t.close}
        </Button>
      </div>
    </div>
  );
}
