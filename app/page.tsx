import { listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

// Página provisória da Fase 0: só confirma que o conteúdo carrega e que os tokens
// estão aplicados. O catálogo completo chega na Fase 1.
export default async function Home() {
  const cases = await listPublishedCases();
  const t = strings.catalog;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-typed text-3xl font-bold text-ink">{strings.app.name}</h1>
      <p className="mt-3 max-w-prose text-paper-5">{strings.app.description}</p>

      <h2 className="mt-12 font-typed text-xl font-bold">{t.heading}</h2>
      {cases.length === 0 ? (
        <p className="mt-4 text-paper-5">{t.empty}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {cases.map((c) => (
            <li key={c.slug} className="rounded-sheet bg-paper-0 p-5 shadow-sheet">
              <p className="font-typed text-lg font-bold">{c.title}</p>
              <p className="mt-1 text-sm text-paper-5">
                {c.period} — {c.place} — {t.duration(c.durationMinutes)}
              </p>
              {c.fictional && <p className="mt-2 text-sm font-bold text-stamp">{t.fictional}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
