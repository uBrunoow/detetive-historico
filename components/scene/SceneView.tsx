"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { EvidenceViewer } from "@/components/scene/EvidenceViewer";
import { Notebook } from "@/components/notebook/Notebook";
import { ObjectPanel } from "@/components/scene/ObjectPanel";
import type { PublicCase, SceneObject } from "@/lib/content/schema";
import { collectEvidence, isUnlocked, markExamined, undiscoveredCount } from "@/lib/game/scene";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.scene;

type Props = { caseData: PublicCase; sceneId: string };

export function SceneView({ caseData, sceneId }: Props) {
  const scene = caseData.scenes.find((s) => s.id === sceneId)!;
  const [progress, update] = useProgress(caseData.slug);
  const hydrated = useHydrated();
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAreas, setShowAreas] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const titleId = useId();
  const notebookTitleId = useId();
  const [notebookOpen, setNotebookOpen] = useState(false);

  useEffect(() => {
    update((p) => (p.lastSceneId === sceneId ? p : { ...p, lastSceneId: sceneId }));
  }, [sceneId, update]);

  // A luz da luminária acompanha o ponteiro, ou o objeto com foco do teclado.
  const aimLight = useCallback((xPct: number, yPct: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      stageRef.current?.style.setProperty("--lx", `${xPct}%`);
      stageRef.current?.style.setProperty("--ly", `${yPct}%`);
    });
  }, []);

  const openObject = openId ? scene.objects.find((o) => o.id === openId) : undefined;
  const openLocked = openObject ? !isUnlocked(openObject, progress.examined) : false;
  const openEvidence =
    openObject && !openLocked && openObject.evidenceId
      ? caseData.evidence.find((e) => e.id === openObject.evidenceId)
      : undefined;

  function examine(obj: SceneObject) {
    setOpenId(obj.id);
    update((p) => markExamined(p, obj.id, sceneId));
  }

  const collectedCount = Object.keys(progress.cards).length;
  // Completude por lugar, em texto: fontes guardadas / fontes que existem ali (não diz quais faltam).
  const sceneTally = (id: string) => {
    const ids = caseData.scenes.find((s) => s.id === id)!.objects.flatMap((o) => (o.evidenceId ? [o.evidenceId] : []));
    return { found: ids.filter((e) => progress.cards[e]).length, total: ids.length };
  };
  const remaining = undiscoveredCount(caseData, progress);

  return (
    <div className="flex min-h-dvh flex-col bg-wood">
      <header className="text-on-wood">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            href={`/casos/${caseData.slug}`}
            className="px-btn px-btn-paper text-base"
          >
            <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
              <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
            </svg>
            {t.backToBriefing}
          </Link>
          <p className="order-last basis-full font-pixel text-lg font-semibold leading-snug sm:order-none sm:min-w-0 sm:flex-1 sm:basis-auto sm:truncate sm:text-xl">
            {caseData.title}
          </p>
          <p className="ml-auto font-pixel text-base" aria-live="polite">
            {hydrated ? t.progress(collectedCount, caseData.evidence.length) : " "}
          </p>
          <button
            type="button"
            onClick={() => setNotebookOpen(true)}
            aria-label={strings.notebook.openLabel(collectedCount)}
            className="px-btn text-base"
          >
            <Image src="/art/ui/pasta.png" alt="" width={24} height={24} unoptimized className="pixelated" />
            {strings.notebook.open}
          </button>
          <Link href={`/casos/${caseData.slug}/linha-do-tempo`} className="px-btn px-btn-paper text-base">
            {strings.timeline.title}
          </Link>
        </div>
      </header>

      <main id="conteudo" className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-0 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 sm:px-0">
          <nav aria-label={t.scenesNav} className="relative -mb-px max-w-full overflow-x-auto">
            <ul className="flex gap-1">
              {caseData.scenes.map((s) => {
                const current = s.id === sceneId;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/casos/${caseData.slug}/cena/${s.id}`}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex min-h-touch items-center whitespace-nowrap px-4 font-pixel text-base font-semibold sm:px-5 ${
                        current ? "bg-manila text-ink" : "bg-wood-light text-on-wood hover:bg-manila-deep"
                      }`}
                    >
                      {s.name}
                      {hydrated && (
                        <span className="ml-2 opacity-80">
                          <span aria-hidden>{sceneTally(s.id).found}/{sceneTally(s.id).total}</span>
                          <span className="sr-only">, {t.sceneSources(sceneTally(s.id).found, sceneTally(s.id).total)}</span>
                        </span>
                      )}
                      {current && <span className="sr-only"> ({t.currentScene})</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            type="button"
            aria-pressed={showAreas}
            onClick={() => setShowAreas((v) => !v)}
            className="px-btn px-btn-paper mb-2 text-base"
          >
            <svg aria-hidden viewBox="0 0 10 10" className="size-5" fill="currentColor" shapeRendering="crispEdges">
              <path d="M0 0h2v1H0zM4 0h2v1H4zM8 0h2v2H9V1H8zM0 4h1v2H0zM9 4h1v2H9zM0 8h1v1h1v1H0zM4 9h2v1H4zM9 8h1v2H8V9h1z" />
              {showAreas && <path d="M2 5h1v1H2zM3 6h1v1H3zM4 5h1v1H4zM5 4h1v1H5zM6 3h1v1H6zM7 2h1v1H7z" />}
            </svg>
            {showAreas ? t.hideAreas : t.showAreas}
          </button>
        </div>

        <div className="bg-manila pt-2 sm:rounded-b-[6px] sm:p-2">
          <div
            role="region"
            aria-label={t.sceneRegion(scene.name)}
            tabIndex={0}
            className="overflow-x-auto overscroll-x-contain"
          >
            <div
              ref={stageRef}
              key={sceneId}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                aimLight(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
              }}
              data-areas={showAreas || undefined}
              className="scene-stage relative mx-auto aspect-[16/10] min-w-[44rem] md:min-w-0 md:max-w-[calc((100dvh-11.5rem)*1.6)]"
            >
              <Image src={scene.image.src} alt={scene.image.alt} fill priority unoptimized className="object-cover" />
              <div aria-hidden className="scene-light pointer-events-none absolute inset-0" />
              <div aria-hidden className="scene-power pointer-events-none absolute inset-0" />

              {scene.objects.map((obj) => {
                const examined = hydrated && progress.examined.includes(obj.id);
                const locked = !isUnlocked(obj, progress.examined);
                const inNotebook = Boolean(obj.evidenceId && progress.cards[obj.evidenceId] && !locked);
                const states = [examined && t.examined, locked && t.locked, inNotebook && t.collected].filter(Boolean);
                const { x, y, w, h } = obj.hotspot;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => examine(obj)}
                    onFocus={() => aimLight(x + w / 2, y + h / 2)}
                    aria-label={states.length ? `${obj.label} (${states.join(", ")})` : obj.label}
                    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                    className="hotspot group absolute min-h-touch min-w-touch"
                  >
                    <span aria-hidden className="hotspot-tag">
                      {obj.label}
                      {states.length > 0 && <span className="hotspot-state">{states.join(", ")}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-on-wood sm:px-0">
          <p>{hydrated ? t.undiscovered(remaining) : " "}</p>
          <p className="md:hidden">{t.panHint}</p>
        </div>

        <details className="mx-4 mb-10 bg-paper-0 text-ink px-frame sm:mx-0">
          <summary className="flex min-h-touch cursor-pointer items-center px-4 font-pixel text-base font-semibold">
            {t.objectList}
          </summary>
          <div className="border-t border-paper-3 px-4 pb-4 pt-2">
            <p className="text-sm text-paper-5">{t.objectListHint}</p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {scene.objects.map((obj) => {
                const examined = hydrated && progress.examined.includes(obj.id);
                const locked = !isUnlocked(obj, progress.examined);
                const inNotebook = Boolean(obj.evidenceId && progress.cards[obj.evidenceId] && !locked);
                const states = [examined && t.examined, locked && t.locked, inNotebook && t.collected].filter(Boolean);
                return (
                  <li key={obj.id}>
                    <button
                      type="button"
                      onClick={() => examine(obj)}
                      className="flex min-h-touch w-full items-center justify-between gap-3 px-2 text-left hover:bg-paper-2"
                    >
                      <span>{obj.label}</span>
                      {states.length > 0 && (
                        <span className="shrink-0 font-pixel text-xs font-bold text-stamp">{states.join(", ")}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      </main>

      <Dialog
        open={Boolean(openObject)}
        onClose={() => setOpenId(null)}
        labelledBy={titleId}
        className={openEvidence || openObject?.content?.transcription ? "max-w-5xl" : "max-w-xl"}
      >
        {openObject && openEvidence ? (
          <EvidenceViewer
            evidence={openEvidence}
            collected={Boolean(progress.cards[openEvidence.id])}
            onCollect={() => update((p) => collectEvidence(p, openEvidence.id))}
            onClose={() => setOpenId(null)}
            titleId={titleId}
          />
        ) : openObject ? (
          <ObjectPanel object={openObject} locked={openLocked} onClose={() => setOpenId(null)} titleId={titleId} />
        ) : null}
      </Dialog>

      <Dialog open={notebookOpen} onClose={() => setNotebookOpen(false)} labelledBy={notebookTitleId} className="max-w-6xl">
        <Notebook
          caseData={caseData}
          progress={progress}
          update={update}
          onClose={() => setNotebookOpen(false)}
          titleId={notebookTitleId}
          timelineHref={`/casos/${caseData.slug}/linha-do-tempo`}
        />
      </Dialog>
    </div>
  );
}
