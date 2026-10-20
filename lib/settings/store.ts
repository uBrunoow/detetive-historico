"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SETTINGS_KEY } from "./boot";

/** Preferências do jogador neste navegador (tela Opções). */
export type Settings = {
  reduceMotion: boolean;
  plainLetters: boolean;
  textSize: "normal" | "large";
};

export const defaultSettings: Settings = { reduceMotion: false, plainLetters: false, textSize: "normal" };

let cache: Settings | null = null;
const listeners = new Set<() => void>();

function load(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function read() {
  return (cache ??= load());
}

/** Reflete as preferências em atributos de <html>, que o CSS usa. */
export function applySettings(s: Settings) {
  const el = document.documentElement;
  el.dataset.reduceMotion = String(s.reduceMotion);
  el.dataset.textSize = s.textSize;
}

export function updateSettings(patch: Partial<Settings>) {
  cache = { ...read(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(cache));
  } catch {
    // Sem armazenamento: vale só nesta aba.
  }
  applySettings(cache);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, read, () => defaultSettings);
  const update = useCallback((patch: Partial<Settings>) => updateSettings(patch), []);
  return [settings, update] as const;
}
