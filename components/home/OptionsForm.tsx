"use client";

import { useHydrated } from "@/lib/progress/store";
import { useSettings } from "@/lib/settings/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.optionsPage;

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="max-w-md">
        <p className="font-pixel text-lg font-semibold">{label}</p>
        <p className="text-sm text-paper-5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`px-btn min-w-32 text-base ${checked ? "px-btn-ink" : "px-btn-paper"}`}
      >
        {checked ? t.on : t.off}
      </button>
    </div>
  );
}

export function OptionsForm() {
  const [s, update] = useSettings();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="mt-10 h-72" />;

  return (
    <div className="mt-10 max-w-2xl divide-y-2 divide-dashed divide-paper-3 bg-paper-0 px-6 text-ink px-frame">
      <Toggle label={t.reduceMotion} hint={t.reduceMotionHint} checked={s.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
      <Toggle label={t.plainLetters} hint={t.plainLettersHint} checked={s.plainLetters} onChange={(v) => update({ plainLetters: v })} />
      <fieldset className="flex flex-wrap items-center justify-between gap-4 py-5">
        <legend className="sr-only">{t.textSize}</legend>
        <p aria-hidden className="font-pixel text-lg font-semibold">
          {t.textSize}
        </p>
        <div className="flex gap-4">
          {(["normal", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={s.textSize === size}
              onClick={() => update({ textSize: size })}
              className={`px-btn text-base ${s.textSize === size ? "px-btn-ink" : "px-btn-paper"}`}
            >
              {size === "normal" ? t.textNormal : t.textLarge}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
