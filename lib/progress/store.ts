"use client";

import { useCallback, useSyncExternalStore } from "react";
import { emptyProgress, type CaseProgress } from "./types";

/**
 * Armazenamento do progresso no localStorage, com cache em memória para que
 * `useSyncExternalStore` receba sempre a mesma referência enquanto nada muda.
 * Toda leitura/escrita é protegida: em janela anônima ou com armazenamento
 * bloqueado o jogo continua funcionando, só não lembra o progresso.
 */
const KEY_PREFIX = "detetive-historico:v1:progress:";
const cache = new Map<string, CaseProgress>();
const listeners = new Set<() => void>();
const serverSnapshots = new Map<string, CaseProgress>();

function key(slug: string) {
  return KEY_PREFIX + slug;
}

function load(slug: string): CaseProgress {
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<CaseProgress>;
    if (parsed.version !== 1) return emptyProgress();
    return { ...emptyProgress(), ...parsed };
  } catch {
    return emptyProgress();
  }
}

export function readProgress(slug: string): CaseProgress {
  let value = cache.get(slug);
  if (!value) {
    value = load(slug);
    cache.set(slug, value);
  }
  return value;
}

export function updateProgress(slug: string, update: (current: CaseProgress) => CaseProgress) {
  const next = { ...update(readProgress(slug)), updatedAt: new Date().toISOString() };
  cache.set(slug, next);
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(next));
  } catch {
    // Sem armazenamento disponível: o estado vale só nesta aba.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(KEY_PREFIX)) {
      cache.delete(e.key.slice(KEY_PREFIX.length));
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function serverSnapshot(slug: string) {
  let value = serverSnapshots.get(slug);
  if (!value) {
    value = emptyProgress();
    serverSnapshots.set(slug, value);
  }
  return value;
}

export function useProgress(slug: string) {
  const progress = useSyncExternalStore(
    subscribe,
    () => readProgress(slug),
    () => serverSnapshot(slug),
  );
  const update = useCallback((fn: (p: CaseProgress) => CaseProgress) => updateProgress(slug, fn), [slug]);
  return [progress, update] as const;
}

/** Verdadeiro só depois da hidratação: evita mostrar "não iniciado" antes de ler o armazenamento. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
