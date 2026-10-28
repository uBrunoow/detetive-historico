"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { EvidenceViewer } from "@/components/scene/EvidenceViewer";
import { Notebook } from "@/components/notebook/Notebook";
import { ObjectPanel } from "@/components/scene/ObjectPanel";
import { NightSky } from "@/components/pixel/NightSky";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { StarRating } from "@/components/ui/StarRating";
import { DetectiveDialog } from "@/components/scene/DetectiveDialog";
import type { PublicCase, SceneObject } from "@/lib/content/schema";
import { collectEvidence, isUnlocked, markExamined, undiscoveredCount } from "@/lib/game/scene";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";
import { answerQuiz, finishPieces, getGameState, skipCode, tryCode } from "@/lib/game/actions";

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
  const [gameState, setGameState] = useState<Awaited<ReturnType<typeof getGameState>> | null>(null);

  const refreshGameState = useCallback(async () => {
    setGameState(await getGameState(caseData.slug));
  }, [caseData.slug]);

  useEffect(() => {
    getGameState(caseData.slug).then(setGameState).catch(() => undefined);
  }, [caseData.slug]);

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
  const openLocked = openObject ? !isUnlocked(openObject, progress.examined, progress.unlocked) : false;
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
  // A fala do detetive: a pergunta do caso no começo, depois o que acabou de examinar e quanto falta.
  const lastExamined = scene.objects.find((o) => o.id === progress.examined.at(-1));
  const detectiveLine =
    remaining === 0
      ? { text: "", emphasis: t.toVerdict }
      : progress.examined.length === 0
        ? { text: t.opening, emphasis: caseData.question }
        : { text: lastExamined ? t.lastExamined(lastExamined.label) : "", emphasis: t.undiscovered(remaining) };

  const checksLeft = gameState?.checksLeft ?? caseData.maxTimelineChecks;
  const verdictHref = `/casos/${caseData.slug}/conclusao`;
  const enoughCards = collectedCount >= caseData.minCardsToResolve;

  return (
    <div className="game-world iris-open flex min-h-dvh flex-col text-bone">
      <NightSky rain={false} />

      {/* HUD do mockup: o caso à esquerda; lupas (conferências) e moeda (fontes) à direita. */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/casos/${caseData.slug}`} className="px-btn px-btn-paper text-base">
            <span aria-hidden>←</span>
            {t.backToBriefing}
          </Link>
          <span className="font-pixel text-2xl text-bone sm:text-3xl">{caseData.title}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex gap-1.5" role="img" aria-label={t.checksLeft(checksLeft, caseData.maxTimelineChecks)}>
            {Array.from({ length: caseData.maxTimelineChecks }, (_, i) => (
              <Image
                key={i}
                src="/art/ui/lupa.png"
                alt=""
                width={36}
                height={36}
                unoptimized
                className={`pixelated drop-shadow-[0_0_6px_rgb(232_169_58/0.45)] ${i < checksLeft ? "" : "opacity-40 grayscale"}`}
              />
            ))}
          </span>
          <span className="flex items-center gap-2 font-pixel text-3xl tabular-nums" aria-live="polite">
            <PixelSprite name="coin" className="coin-spin w-7" />
            <span aria-hidden>{hydrated ? `${collectedCount}/${caseData.evidence.length}` : " "}</span>
            <span className="sr-only">{hydrated ? t.sourcesFound(collectedCount, caseData.evidence.length) : ""}</span>
          </span>
          {gameState?.official && <StarRating stars={gameState.official.stars} />}
        </div>
      </header>

      <main id="conteudo" className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 sm:px-6">
        <h1 className="px-title mt-6 text-4xl leading-none sm:text-5xl">{scene.name}</h1>
        <p className="mt-1.5 font-semibold text-mist">{t.darkHint}</p>

        {caseData.scenes.length > 1 && (
          <nav aria-label={t.scenesNav} className="mt-4 max-w-full overflow-x-auto">
            <ul className="flex gap-2">
              {caseData.scenes.map((s) => {
                const current = s.id === sceneId;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/casos/${caseData.slug}/cena/${s.id}`}
                      aria-current={current ? "page" : undefined}
                      className={`px-btn whitespace-nowrap text-base ${current ? "" : "px-btn-paper"}`}
                    >
                      {s.name}
                      {hydrated && (
                        <span className="opacity-80">
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
        )}

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {/* A sala, no escuro, em moldura preta. */}
          <div
            role="region"
            aria-label={t.sceneRegion(scene.name)}
            tabIndex={0}
            className="overflow-x-auto overscroll-x-contain shadow-[0_0_0_6px_#000,0_24px_40px_-12px_#000]"
          >
            <div
              ref={stageRef}
              key={sceneId}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                aimLight(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
              }}
              data-areas={showAreas || undefined}
              data-lit={(hydrated && remaining === 0) || undefined}
              className="scene-stage relative mx-auto aspect-[16/10] min-w-[44rem] md:min-w-0"
            >
              <Image src={scene.image.src} alt={scene.image.alt} fill priority unoptimized className="object-cover" />
              <div aria-hidden className="scene-light pointer-events-none absolute inset-0" />
              <div aria-hidden className="scene-power pointer-events-none absolute inset-0" />

              {scene.objects.map((obj) => {
                const examined = hydrated && progress.examined.includes(obj.id);
                const locked = !isUnlocked(obj, progress.examined, progress.unlocked);
                const inNotebook = Boolean(obj.evidenceId && progress.cards[obj.evidenceId] && !locked);
                const states = [examined && t.examined, locked && t.locked, inNotebook && t.collected].filter(Boolean);
                // Como no mockup: os brilhos marcam as fontes que ainda não foram guardadas.
                const sparkle = hydrated && Boolean(obj.evidenceId) && !progress.cards[obj.evidenceId!];
                const { x, y, w, h } = obj.hotspot;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => examine(obj)}
                    onFocus={() => aimLight(x + w / 2, y + h / 2)}
                    aria-label={states.length ? `${obj.label} (${states.join(", ")})` : obj.label}
                    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                    className={`hotspot group absolute min-h-touch min-w-touch ${sparkle ? "hotspot-new" : ""}`}
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

          {/* Pistas: um espaço por fonte do caso; "?" até ser guardada. */}
          <aside aria-labelledby="pistas" className="grid gap-4 bg-paper-0 p-5 text-ink px-frame">
            <h2 id="pistas" className="flex items-baseline justify-between font-title text-3xl text-stamp">
              {t.bag}
              <small className="font-pixel text-2xl text-ink tabular-nums">
                {hydrated ? `${collectedCount}/${caseData.evidence.length}` : ""}
              </small>
            </h2>
            <ul className="grid grid-cols-3 gap-3 [perspective:600px]">
              {caseData.evidence.map((ev) => {
                const has = hydrated && Boolean(progress.cards[ev.id]);
                return (
                  <li
                    key={`${ev.id}-${has}`}
                    className={`relative grid aspect-[4/3] place-items-center overflow-hidden bg-paper-2 px-frame-flat [--px:2px] ${has ? "slot-flip" : ""}`}
                  >
                    {has ? (
                      <button type="button" onClick={() => setNotebookOpen(true)} className="absolute inset-0" aria-label={strings.notebook.openLabel(collectedCount)}>
                        <Image src={ev.image.src} alt={ev.title} fill unoptimized sizes="7rem" className="pixelated object-cover" />
                      </button>
                    ) : (
                      <span aria-label={t.emptySlot} className="font-pixel text-4xl text-paper-4">
                        ?
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <Link href={verdictHref} className={`px-btn w-full text-2xl ${enoughCards ? "px-btn-call" : ""}`}>
              {t.openVerdict}
            </Link>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setNotebookOpen(true)} aria-label={strings.notebook.openLabel(collectedCount)} className="px-btn px-btn-paper text-base">
                <Image src="/art/ui/pasta.png" alt="" width={20} height={20} unoptimized className="pixelated" />
                {strings.notebook.open}
              </button>
              <Link href={`/casos/${caseData.slug}/linha-do-tempo`} className="px-btn px-btn-paper text-base">
                {strings.timeline.title}
              </Link>
              <button type="button" aria-pressed={showAreas} onClick={() => setShowAreas((v) => !v)} className="px-btn px-btn-paper text-base">
                {showAreas ? t.hideAreas : t.showAreas}
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-6">{hydrated && <DetectiveDialog {...detectiveLine} />}</div>
        <p className="mt-2 text-sm text-mist md:hidden">{t.panHint}</p>

        <details className="mt-6 bg-paper-0 text-ink px-frame">
          <summary className="flex min-h-touch cursor-pointer items-center px-4 font-pixel text-xl">{t.objectList}</summary>
          <div className="border-t border-paper-3 px-4 pb-4 pt-2">
            <p className="text-sm text-paper-5">{t.objectListHint}</p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {scene.objects.map((obj) => {
                const examined = hydrated && progress.examined.includes(obj.id);
                const locked = !isUnlocked(obj, progress.examined, progress.unlocked);
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
                      {states.length > 0 && <span className="shrink-0 text-xs font-bold text-stamp">{states.join(", ")}</span>}
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
            quizAnswered={Boolean(gameState?.answeredQuiz.includes(openEvidence.id))}
            onQuizAnswer={async (index) => {
              const result = await answerQuiz(caseData.slug, openEvidence.id, index);
              await refreshGameState();
              return { correct: "correct" in result && result.correct, explanation: "explanation" in result ? result.explanation : "" };
            }}
            onQuizLater={() => setOpenId(null)}
            piecesDone={gameState?.pieces !== null && gameState?.pieces !== undefined}
            onPiecesFinish={async (how) => { await finishPieces(caseData.slug, how); await refreshGameState(); }}
            onClose={() => setOpenId(null)}
            titleId={titleId}
          />
        ) : openObject ? (
          <ObjectPanel
            object={openObject}
            locked={openLocked}
            opened={gameState?.openedCodes.includes(openObject.id)}
            onTryCode={async (input) => {
              const result = await tryCode(caseData.slug, openObject.id, input);
              if ("opened" in result && result.opened) {
                update((p) => p.unlocked.includes(openObject.id) ? p : { ...p, unlocked: [...p.unlocked, openObject.id] });
                await refreshGameState();
              }
              return "opened" in result ? { opened: result.opened, showHint: result.showHint, hint: result.hint, canSkip: result.canSkip } : { opened: false, showHint: false, canSkip: false };
            }}
            onSkipCode={async () => {
              await skipCode(caseData.slug, openObject.id);
              update((p) => p.unlocked.includes(openObject.id) ? p : { ...p, unlocked: [...p.unlocked, openObject.id] });
              await refreshGameState();
            }}
            onClose={() => setOpenId(null)}
            titleId={titleId}
          />
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
