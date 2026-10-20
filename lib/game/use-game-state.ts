"use client";

import { startTransition, useEffect, useState } from "react";
import { updateProgress } from "@/lib/progress/store";
import { getGameState, type PublicGameState } from "./actions";

/**
 * Contadores e resultado vindos do servidor (cookie assinado). `null` enquanto carrega.
 */
export function useGameState(slug: string) {
  const [state, setState] = useState<PublicGameState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      try {
        const next = await getGameState(slug);
        setState(next);
        // Encerrado no servidor (talvez em outra aba): o catálogo e as medalhas leem o progresso local.
        if (next.outcome) updateProgress(slug, (p) => (p.status === next.outcome ? p : { ...p, status: next.outcome! }));
      } catch {
        setFailed(true);
      }
    });
  }, [slug]);

  return { state, setState, failed };
}
