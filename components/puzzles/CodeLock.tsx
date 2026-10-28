"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CodeUnlock } from "@/lib/content/schema";

type Props = {
  unlock: CodeUnlock;
  opened?: boolean;
  onTry: (input: string) => Promise<{ opened: boolean; showHint: boolean; hint?: string; canSkip: boolean }>;
  onSkip: () => Promise<void>;
};

export function CodeLock({ unlock, opened = false, onTry, onSkip }: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState<string>();
  const [canSkip, setCanSkip] = useState(false);

  if (opened) return <p role="status" aria-live="polite" className="mt-4 font-semibold text-stamp">Cadeado aberto.</p>;
  return (
    <div className="mt-5 border-t border-dashed border-paper-4 pt-4">
      <p className="font-semibold">{unlock.code.prompt}</p>
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
          const result = await onTry(input);
          setMessage(result.opened ? "Cadeado aberto." : "Ainda não. Revise a pista e tente outra vez.");
          setHint(result.hint);
          setCanSkip(result.canSkip);
          if (result.opened) setInput("");
        } finally {
          setBusy(false);
        }
      }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode={unlock.code.inputMode}
          aria-label="Código do cadeado"
          className="min-h-touch min-w-32 border-2 border-ink bg-paper-1 px-3 font-mono text-lg"
        />
        <Button type="submit" disabled={busy}>{busy ? "Conferindo…" : "Abrir"}</Button>
      </form>
      {hint && <p className="mt-3 text-sm text-paper-5">{hint}</p>}
      {canSkip && (
        <Button variant="secondary" className="mt-3" onClick={async () => { await onSkip(); setMessage("Cadeado aberto sem pontos."); }}>
          Abrir mesmo assim (sem os pontos)
        </Button>
      )}
      <p role="status" aria-live="polite" className="mt-3 text-sm">{message}</p>
    </div>
  );
}
