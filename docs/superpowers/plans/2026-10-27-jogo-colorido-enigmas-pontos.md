# Jogo colorido, enigmas e pontuação: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o beta num jogo 2D em pixel colorido e consistente, com quatro tipos de enigma, conclusão por escolha com justificativa opcional, pontos e estrelas, e "jogar de novo" que preserva o primeiro resultado.

**Architecture:**
- Os enigmas e as alternativas são dados do caso. A parte pública diz que o enigma existe e mostra as opções. As respostas ficam no `solution.json` e só o servidor confere, por Server Actions.
- O estado oficial (tentativas, enigmas, primeiro resultado) vai para o cookie assinado, versão 2. A pontuação é uma função pura em `lib/game/score.ts`, chamada no servidor ao encerrar.
- A UI ganha um quadro único (`GameScreen` com HUD) e tokens novos e coloridos em `app/globals.css`.

**Tech Stack:** Next.js 16.4.3 (App Router, Server Actions, `"use cache"`), React 19, TypeScript strict, Tailwind 4, zod 4, vitest. Arte por script em Node (`scripts/pixel-art/`).

**Spec:** `docs/superpowers/specs/2026-10-27-jogo-colorido-enigmas-pontos-design.md`

## Global Constraints

- Ler `node_modules/next/dist/docs/` antes de mexer em APIs do Next (AGENTS.md).
- Nada que revele resposta vai para o `case.json` ou para o navegador antes do encerramento. Isso inclui alternativa certa, códigos, respostas das perguntas, época certa e ordem de referência. `pnpm check:leaks` precisa continuar passando.
- Schemas `strict`. Os campos de enigma são **opcionais**. `conclusion.choices` (4 alternativas) é **obrigatório** em caso publicado.
- Acessibilidade:
  - tudo funciona só com teclado;
  - `aria-live` nos resultados;
  - estado nunca só por cor;
  - contraste AA (o teste `tests/unit/contrast.test.ts` cobre os tokens);
  - alvo mínimo de 44 px;
  - animações respeitam "reduzir movimento".
- Tipografia:
  - Pixelify Sans só em títulos de 26 px ou mais;
  - UI, números e datas em Atkinson Hyperlegible;
  - Courier e letra manuscrita só dentro dos documentos.
- Arte original. Nada de personagens, cenários, logotipos ou paletas copiados de Sonic, Mario ou outros jogos.
- Voz do `PRODUCT.md`: 11 anos, acolhedora, "revise", nunca "você falhou". Todos os textos de UI ficam em `lib/strings/pt-BR.ts`.
- Pontos (valores exatos do spec):

  | Item | Pontos |
  |---|---|
  | Escolha certa na 1ª | 500 |
  | Escolha certa na 2ª | 250 |
  | Ordem | até 300 |
  | Justificativa aceita / parcial | 150 / 75 |
  | Época certa na 1ª | 100 |
  | Cada cadeado sem pular | 50 |
  | Peças sem pular | 50 |
  | Cada pergunta certa | 25 |
  | Cada conferência usada | −25 |

  Mínimo 0.
- Ordem = (cartas "ordered" + cartas "correctlyOutside") ÷ total de cartas da referência.
- Estrelas:
  - ★1: resolvido;
  - ★2: resolvido e ordem acima de 0,70;
  - ★3: resolvido na 1ª escolha, ordem = 1 e justificativa aceita ou parcial.
  - Não resolvido = 0 estrelas, mas os pontos aparecem.
- 2 escolhas por caso. Justificativa só vale se a escolha estiver certa; vale a melhor. Com menos de 3 palavras é ignorada.
- Saídas dos enigmas:
  - cadeado: dica após 2 erros, "Abrir mesmo assim" após 3;
  - peças: "Pular" após 60 s;
  - pergunta sobre a fonte: nunca impede guardar.
- "Jogar de novo" zera o caso, mas o resultado oficial (estrelas e pontos) é o da 1ª conclusão.

## Review Focus

- **Aluno com cookie da versão 1 (beta atual) abre o jogo:** o estado antigo é lido como v2 sem erro, e um caso já encerrado continua encerrado. Teste em Task 2.
- **Aluno digita o código com espaços ou zeros à esquerda** (" 1500 ", "01500"): é aceito se, depois de tirar espaços e zeros à esquerda, for igual ao código. Teste em Task 3.
- **Aluno guarda a fonte da pergunta, recarrega a página e a pergunta volta:** responder de novo não soma pontos duas vezes. O servidor guarda o primeiro resultado por evidência. Teste em Task 3.
- **Aluno clica "Jogar de novo" e termina melhor:** as Fases continuam mostrando o 1º resultado. O placar da nova partida aparece como "Treino". Teste em Task 3 (servidor) e Task 4 (local).
- **Caso sem nenhum enigma opcional (ex.: um caso novo):** a cena, a pontuação e as estrelas funcionam, e os itens ausentes simplesmente não somam. Teste em Task 2.

---

### Task 1: Formato do caso para enigmas e alternativas

**Files:**
- Modify: `lib/content/schema.ts`, `lib/content/check.ts`
- Test: `tests/unit/content.test.ts` (novos casos de erro), `tests/unit/puzzles-schema.test.ts` (novo)

**Interfaces:**
- Produces (público, em `publicCaseSchema`):
  - `epochGuess?: { question: string; options: string[] }`, com exatamente 4 opções;
  - em `sceneObjectSchema.unlock`, uma união. A forma atual `{ requiresExamined: string[]; lockedMessage: string }` continua, e entra a nova `{ code: { prompt: string; hint: string; inputMode: "numeric" | "text" }; lockedMessage: string }`;
  - em `evidenceSchema`: `puzzle?: "pieces"` e `quiz?: { question: string; options: string[] }`, com exatamente 3 opções;
  - `conclusion: { choices: { id: string; text: string }[]; maxChoices: number }`, com exatamente 4 escolhas e `maxChoices` padrão 2.
  - Remover `maxAttempts` do schema público. As tentativas agora são `conclusion.maxChoices`.
- Produces (privado, em `privateCaseSchema`):
  - `epochAnswer?: number`, índice de 0 a 3;
  - `codes?: Record<objectId, string>`;
  - `quizAnswers?: Record<evidenceId, { correct: number; explanation: string }>`;
  - `choiceAnswer: { correctId: string; wrongFeedback: Record<choiceId, string> }`.
- Produces: tipos exportados `EpochGuess`, `CodeUnlock`, `Quiz`, `ConclusionChoice`.

- [ ] **Step 1: Write the failing tests** em `tests/unit/puzzles-schema.test.ts`, usando `checkCaseBundle` sobre cópias de `demo-biblioteca` alteradas em memória:
  - `epochGuess sem epochAnswer` → problemas contêm `"epochGuess sem epochAnswer"`;
  - `objeto com code sem entrada em codes` → `"<scene>/<obj>: cadeado sem código"`;
  - `quiz sem quizAnswers` → `"<ev>: pergunta sem resposta"`;
  - `quizAnswers.correct fora de 0..2` → `"<ev>: resposta da pergunta fora das opções"`;
  - `choiceAnswer.correctId inexistente` → `"alternativa certa inexistente"`;
  - `alternativa errada sem feedback` → `"alternativa <id> sem feedback"`;
  - schema público rejeita `choices` com 3 itens.
- [ ] **Step 2:** `pnpm vitest run tests/unit/puzzles-schema.test.ts`. Esperado: FAIL.
- [ ] **Step 3:** Implementar os schemas e as regras novas em `checkCaseBundle`, com as mensagens exatas acima. Ajustar `isUnlocked` em `lib/game/scene.ts` para o novo tipo de `unlock`: com `requiresExamined`, a regra de hoje; com `code`, fica destrancado se `unlocked.includes(obj.id)`. Na assinatura `isUnlocked(obj, examined, unlocked = [])`, o parâmetro novo é opcional para não quebrar quem chama.
- [ ] **Step 4:** Conteúdo provisório para o build passar. Acrescentar `conclusion` (4 alternativas) e `choiceAnswer` nos 6 casos, com texto final. Escrever cada alternativa errada a partir dos `commonErrors`/`partialAnswers` existentes do caso, e a certa a partir do `referenceAnswer` resumido em uma frase. Remover `maxAttempts` dos `case.json`.
- [ ] **Step 5:** `pnpm test`. Esperado: PASS.
- [ ] **Step 6:** Commit `Formato do caso: enigmas opcionais e alternativas da conclusão`.

### Task 2: Pontuação pura e estado assinado v2

**Files:**
- Create: `lib/game/score.ts`
- Modify: `lib/game/signed-state.ts`
- Test: `tests/unit/score.test.ts`, `tests/unit/signed-state.test.ts`

**Interfaces:**
- Consumes: `compareTimelines` e `CardOutcome` de `lib/game/closure.ts`; `PlayerOrder` de `lib/game/check.ts`.
- Produces (`signed-state.ts`):

  ```ts
  type PuzzleState = {
    epoch: { tries: number; firstTryCorrect: boolean | null };   // null = ainda não respondeu
    codes: Record<string, { tries: number; opened: boolean; skipped: boolean }>;
    pieces: "solved" | "skipped" | null;
    quiz: Record<string, boolean>;                                // primeiro resultado por evidência
  };
  type Result = { stars: 0 | 1 | 2 | 3; points: number; breakdown: ScoreBreakdown };
  type GameState = {
    v: 2; slug: string; checksUsed: number; choicesUsed: number;
    outcome: "solved" | "failed" | null;
    solvedOnChoice: 1 | 2 | null;
    justification: "accepted" | "partial" | null;                 // a melhor
    puzzles: PuzzleState;
    official: Result | null;   // 1ª conclusão; nunca apagado por restart
    practice: boolean;         // true depois de "Jogar de novo"
  };
  ```

  `decode` aceita `v: 1` e converte: `attemptsUsed` → `choicesUsed: 0`, `outcome` mantido, `puzzles` vazio. Se `outcome` era `"solved"`, vira `official: { stars: 1, points: 500, breakdown }`, com breakdown só de `answer: 500`. `freshState(slug)` devolve v2.
- Produces (`score.ts`):

  ```ts
  type ScoreBreakdown = { answer: number; order: number; justification: number; epoch: number;
                          codes: number; pieces: number; quiz: number; checks: number };
  export function orderRatio(reference: PrivateCase["timelineReference"], player: PlayerOrder): number;
  export function computeResult(input: { state: GameState; reference: PrivateCase["timelineReference"]; player: PlayerOrder }): Result;
  ```

- [ ] **Step 1: Write failing tests** `tests/unit/score.test.ts`, com a referência do caso `caminha`:
  - `orderRatio` com a linha de referência completa e `tordesilhas` fora → `1`;
  - só `partida` e `monte-pascoal` na ordem → `2/6`;
  - resolvido na 1ª, ordem 1, justificativa "partial", época certa, 1 cadeado aberto, peças "solved", 2 perguntas certas, 1 conferência → `points` = 500+300+75+100+50+50+50−25 = **1100**, `stars` = 3;
  - resolvido na 2ª, ordem 0,8 → `points` inclui `answer: 250`, `order: 240`, e `stars` = 2;
  - ordem 0,7 exata → `stars` = 1, porque o limite é "acima de 0,70";
  - `outcome: "failed"` → `stars` = 0, `answer` = 0, os demais itens somam normalmente;
  - muitas conferências → `points` nunca abaixo de 0;
  - caso sem enigmas (`puzzles` vazio) → `epoch/codes/pieces/quiz` = 0, sem erro.
- [ ] **Step 2:** Rodar. Esperado: FAIL.
- [ ] **Step 3:** Implementar. `order` = `Math.round(300 * ratio)`; ratio = (ordered + correctlyOutside) ÷ `reference.length`. Estrelas pelas regras das Global Constraints.
- [ ] **Step 4: Test** `signed-state.test.ts`: um token v1 assinado decodifica como v2, com `official` preenchido quando `outcome` era `"solved"`. Rodar: PASS.
- [ ] **Step 5:** Commit `Pontuação e estado assinado v2`.

### Task 3: Server Actions dos enigmas, da escolha e do recomeço

**Files:**
- Modify: `lib/game/actions.ts` (substituir `submitAnswer` por `submitChoice`)
- Create: `lib/game/puzzles.ts` (regras puras usadas pelas actions)
- Test: `tests/unit/puzzles.test.ts`

**Interfaces:**
- Consumes: Task 1 (schemas), Task 2 (`GameState`, `computeResult`).
- Produces (`puzzles.ts`, puro):
  - `normalizeCode(s: string): string` (trim, tira espaços e zeros à esquerda, minúsculas, sem acentos);
  - `applyEpochGuess(state, index, answer): { state; correct: boolean }`;
  - `applyCodeTry(state, objectId, input, code): { state; opened: boolean; showHint: boolean; canSkip: boolean }` (`showHint` com tries ≥ 2, `canSkip` com tries ≥ 3);
  - `applyQuiz(state, evidenceId, index, answer): { state; correct: boolean; explanation: string }`, que não sobrescreve um resultado já gravado.
- Produces (`actions.ts`, todas com `slug` validado e retornando `state: PublicGameState`):
  - `guessEpoch(slug, index)` → `{ correct, hint?: string }`;
  - `tryCode(slug, objectId, input)` → `{ opened, showHint, hint?: string, canSkip }`;
  - `skipCode(slug, objectId)` → `{ opened: true }` (só com tries ≥ 3);
  - `answerQuiz(slug, evidenceId, index)` → `{ correct, explanation }`;
  - `finishPieces(slug, how: "solved" | "skipped")`;
  - `submitChoice(slug, { choiceId, justification, order })` → `{ verdict: "correct" | "wrong"; feedback: string | null; state }`. Avalia a justificativa com `evaluateAnswer` só quando a escolha está certa e a justificativa tem ≥ 3 palavras. Guarda a melhor. Encerra com `solved` ou com `failed` ao esgotar `maxChoices`. No encerramento: `official ??= computeResult(...)` se `!practice`.
  - `getResult(slug)` → `{ official: Result | null; current: Result | null; practice: boolean }`. `current` só depois do encerramento.
  - `restartCase(slug)` → grava `freshState`, mas mantém `official` e põe `practice: true`.
  - `PublicGameState` ganha `choicesLeft`, `maxChoices`, `practice`, `official: { stars; points } | null`, `epochAnswered: boolean` e `openedCodes: string[]`.
- [ ] **Step 1: Write failing tests** em `tests/unit/puzzles.test.ts`:
  - `normalizeCode(" 01500 ") === "1500"`;
  - `applyCodeTry` com "1499", "1498", "1497": `showHint` só a partir da 2ª tentativa e `canSkip` só na 3ª;
  - `applyQuiz` duas vezes na mesma evidência, a primeira errada e a segunda certa: `state.quiz[ev]` continua `false`;
  - `applyEpochGuess` errado e depois certo: `firstTryCorrect === false`.
- [ ] **Step 2:** Rodar: FAIL. **Step 3:** Implementar `puzzles.ts` e as actions. **Step 4:** Rodar: PASS.
- [ ] **Step 5:** Teste de integração em `tests/unit/casos-beta.test.ts`: substituir as asserções de `evaluateAnswer` por `choiceAnswer.correctId` existente entre as 4 `choices` de cada caso, e por `wrongFeedback` para cada alternativa errada.
- [ ] **Step 6:** `pnpm test && pnpm check:leaks` (depois de `pnpm build`): PASS. Commit `Server Actions: enigmas, escolha final e jogar de novo`.

### Task 4: Progresso local v2 e o bug do contador

**Files:**
- Modify: `lib/progress/types.ts`, `lib/progress/store.ts`, `lib/game/scene.ts`, `components/notebook/Notebook.tsx`
- Test: `tests/unit/scene.test.ts`, `tests/unit/notebook.test.ts`

**Interfaces:**
- Produces:
  - `CaseProgress.version: 2`, com os campos novos `unlocked: string[]`, `official: { stars: number; points: number } | null` (cópia para Fases e HUD) e `practice: boolean`.
  - `attempts` passa a guardar `{ choiceId, justification, verdict: "correct" | "wrong", feedback, at }`.
  - `draft` vira `{ choiceId: string | null; justification: string }`.
  - `readProgress` migra a v1: copia os campos que ainda existem e põe `unlocked: []`, `official: null`, `practice: false`; `attempts` e `draft` antigos são descartados.
  - `undiscoveredCount(c, p)` = fontes sem carta coletada (`!p.cards[e.id]`). O texto "todas as fontes" do caderno usa só isso.
  - `resetProgress(slug, keepOfficial)` em `store.ts`, para "Jogar de novo".
- [ ] **Step 1: Failing test** em `scene.test.ts`:
  - com a gaveta examinada enquanto trancada e o chaveiro examinado depois, sem coletar o bilhete, `undiscoveredCount` é ≥ 1;
  - um progresso v1 salvo migra sem perder `cards` e `timeline`.
- [ ] **Step 2–4:** FAIL, implementar, PASS.
- [ ] **Step 5:** Commit `Progresso v2 e contador de fontes corrigido`.

### Task 5: Sistema visual colorido e quadro de jogo

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`, `components/ui/GameScreen.tsx`, `components/ui/Button.tsx`, `components/ui/Dialog.tsx`, `components/home/PixelBackdrop.tsx`
- Create: `components/ui/GameHud.tsx`, `components/ui/StarRating.tsx`, `DESIGN.md`
- Test: `tests/unit/contrast.test.ts` (atualizar os pares de tokens)

**Interfaces:**
- Produces:
  - `<GameScreen hud={<GameHud …/>} width="stage" | "narrow" | "full">`: palco centralizado, fundo de cenário colorido (céu, colinas e chão em pixel, CSS ou PNG) igual em todas as telas;
  - `<GameHud backHref backLabel title right?: ReactNode />`: uma linha a partir de 1024 px, quebra em 2 linhas fixas no celular;
  - `<StarRating stars={0..3} size="sm" | "lg" label />`, que mostra o texto "2 de 3 estrelas" para leitor de tela;
  - classe `.font-title` (Pixelify, só ≥ 26 px);
  - `.px-btn` e `.hotspot-tag` passam para Atkinson negrito.
- Tokens: atualizar no lugar os tokens existentes para a paleta nova. Os nomes atuais continuam valendo, e acrescentar `--sky`, `--sky-deep`, `--grass`, `--grass-deep`, `--sun` (estrelas e pontos), `--btn-primary`, `--btn-secondary`. Papel e tinta continuam para os documentos. `--ribbon` (vermelho) fica só para alerta.
- [ ] **Step 1:** Ler `reference/craft-floor.md` do skill impeccable (`/home/bruno/.claude/skills/impeccable/reference/craft-floor.md`) antes de editar UI.
- [ ] **Step 2: Failing test:** acrescentar em `contrast.test.ts` os pares novos (tinta sobre `--sky`, `--on-btn` sobre `--btn-primary` e sobre `--btn-secondary`, texto sobre `--sun`) com AA 4,5:1. Rodar: FAIL.
- [ ] **Step 3:** Implementar tokens, componentes, `DESIGN.md` (paleta, tipografia, quadro, regras de cor) e trocar `font-pixel` por Atkinson em tudo que for menor que 26 px (`grep -rn font-pixel components app`). Na mesma passada:
  - em Opções, os botões viram interruptores com `role="switch"` e `aria-checked`, com o rótulo do estado ao lado;
  - na home a 390 px, o título não cobre o letreiro da fachada;
  - o modal do caderno tem altura fixa entre as abas, sem pulo de layout.
- [ ] **Step 4:** `pnpm test` PASS. Em seguida, `pnpm dev` e capturas a 1366×768 e 390×844 de `/`, `/fases`, `/opcoes`, `/creditos` e `/como-jogar`.
- [ ] **Step 5:** Commit `Visual colorido, tipografia legível e quadro de jogo único`.

### Task 6: Arte nova e saída das chaves

**Files:**
- Modify: `scripts/pixel-art/engine.mjs` (paleta), `scenery.mjs`, `demo-biblioteca.mjs`, `abolicao.mjs`, `casos-iniciais.mjs`, `ui.mjs`; `content/cases/*/case.json`
- Output: `public/cases/**`, `public/art/**`

**Interfaces:**
- Consumes: Task 1 (`unlock.code`).
- [ ] **Step 1:** Acrescentar na `PALETTE` as cores da Task 5 (`sky`, `skyDeep`, `grass`, `grassDeep`, `sun`), com os mesmos hex dos tokens. Clarear `wall` e `wood` para tons vivos.
- [ ] **Step 2:** Nos scripts das cenas, redesenhar as paredes e as janelas com a paleta viva e apagar o desenho da chave (caixa H, `hangingKey`, chaveiros). Na capa e no título (`ui.mjs`), céu e chão coloridos.
- [ ] **Step 3:** Nos 6 `case.json`:
  - remover o objeto de contexto da chave (`chaveiro`, `molho-chaves`, `chave-guarda`, `chave-secretario`, `chave-bibliotecaria`, e o chaveiro da abolição);
  - trocar o `unlock` do objeto trancado por `code`;
  - acrescentar em `solution.json` o `codes` correspondente.

  | Caso | Prompt do cadeado | Código | Hint (aponta a fonte) |
  |---|---|---|---|
  | demo-biblioteca | "O cadeado pede o dia em que a agrimensora visitou a biblioteca." | `9` | "Procure no livro de visitas." |
  | abolicao | "O cadeado pede o ano da Lei do Ventre Livre." | `1871` | "Olhe os volumes de leis na estante do escritório." |
  | caminha | "O cadeado pede o dia de abril em que avistaram terra." | `22` | "Leia as folhas sobre a mesa." |
  | inconfidencia | "O cadeado pede o ano da lei do quinto do ouro." | `1750` | "Examine o cofre com a barra de ouro." |
  | vargas | "O cadeado pede o ano do Código Eleitoral." | `1932` | "Leia o jornal oficial dobrado sobre a mesa." |
  | revolucao-industrial | "O cadeado pede o ano da patente da máquina a vapor." | `1769` | "Veja o quadro com o desenho da máquina." |

  `inputMode: "numeric"` em todos.
- [ ] **Step 4:** Rodar os 5 scripts: `node scripts/pixel-art/<arquivo>.mjs`. Montar uma prévia lado a lado (ffmpeg hstack) e conferir: legível, colorido, sem chave na parede, hotspots sobre os objetos.
- [ ] **Step 5:** `pnpm test` PASS (o teste de imagens existentes e o de coerência). Commit `Arte colorida e cadeados com código`.

### Task 7: Fases e briefing enxutos

**Files:**
- Modify: `app/fases/page.tsx`, `components/catalog/LevelCard.tsx`, `app/casos/[slug]/page.tsx`, `components/catalog/StartButton.tsx`, `lib/strings/pt-BR.ts`

**Interfaces:**
- Consumes: `GameScreen`, `GameHud`, `StarRating` (Task 5); `CaseProgress.official` (Task 4).
- [ ] **Step 1:** Fases:
  - grade de 3 colunas a partir de 1280 px, 2 no tablet, 1 no celular;
  - card com capa, título, a pergunta e metadados numa linha (`${period} · ${place} · ${difficulty} · ${duration}`);
  - `StarRating` com `official?.stars ?? 0` e os pontos quando houver;
  - o Tutorial ocupa a largura de 2 colunas, com a etiqueta "Tutorial · comece aqui";
  - selo "Beta: conteúdo em revisão" uma vez, ao lado do título "Fases";
  - sem a aba branca de pasta.
- [ ] **Step 2:** Briefing:
  - botão "Começar/Continuar" no topo, ao lado do título, além de no fim;
  - narrativa em Atkinson;
  - remover "Como investigar";
  - o carimbo "Caso aberto" num canto que não cobre texto (conferir a 390 px).
- [ ] **Step 3:** Capturas a 1366×768 e 390×844. Critérios: o botão "Começar" aparece sem rolar nos dois tamanhos, e no desktop aparecem pelo menos 3 cards de fase.
- [ ] **Step 4:** Commit `Fases e briefing enxutos com estrelas`.

### Task 8: Cena com HUD, cadeado, palpite de época, pergunta e peças

**Files:**
- Modify: `components/scene/SceneView.tsx`, `components/scene/EvidenceViewer.tsx`, `components/scene/ObjectPanel.tsx`
- Create: `components/puzzles/CodeLock.tsx`, `components/puzzles/EpochGuess.tsx`, `components/puzzles/SourceQuiz.tsx`, `components/puzzles/PiecesPuzzle.tsx`, `lib/game/pieces.ts`
- Test: `tests/unit/pieces.test.ts`

**Interfaces:**
- Consumes: as actions da Task 3; `isUnlocked(obj, examined, unlocked)` (Task 1); `GameHud` (Task 5).
- Produces (`lib/game/pieces.ts`, puro):
  - `shuffle(n: number, seed: number): number[]`: nunca devolve já resolvido;
  - `swap(order: number[], a: number, b: number): number[]`;
  - `isSolved(order: number[]): boolean`;
  - `correctCount(order: number[]): number`.
- [ ] **Step 1: Failing test** `pieces.test.ts`:
  - `shuffle(6, s)` é uma permutação e não é `[0..5]`, para 50 seeds;
  - `swap` + `isSolved` resolvem `[1,0,2,3,4,5]`;
  - `correctCount([0,2,1,3,4,5]) === 4`.
  - FAIL → implementar → PASS.
- [ ] **Step 2:** HUD da cena com `GameHud`, sempre em uma linha no desktop:
  - voltar;
  - título;
  - "Fontes: X de N";
  - estrelas oficiais, se houver;
  - Caderno;
  - Linha do tempo.

  Os outros contadores saem. A cena cabe em 1366×768: a altura da imagem é limitada a `calc(100dvh - HUD - abas)`.
- [ ] **Step 3: `CodeLock`.** O painel do objeto trancado com `code`:
  - mostra o `prompt`, o campo `inputMode` e o botão "Abrir";
  - chama `tryCode`;
  - com `showHint`, mostra o `hint`; com `canSkip`, mostra "Abrir mesmo assim (sem os pontos)";
  - ao abrir, grava `unlocked` no progresso e abre a fonte;
  - anuncia por `aria-live`.
- [ ] **Step 4: `EpochGuess`.** Diálogo que aparece uma vez, quando `Object.keys(cards).length` chega a 2 e `!state.epochAnswered`:
  - 4 botões grandes;
  - errar mostra a dica e deixa escolher de novo;
  - acertar mostra "+100" se for na primeira.
- [ ] **Step 5: `SourceQuiz`.** Ao "Guardar no caderno" uma evidência com `quiz`:
  - a carta é guardada primeiro;
  - aparece a pergunta com 3 botões;
  - mostra certo/errado com a explicação e "+25";
  - um "Agora não" fecha sem responder, e a pergunta volta ao reabrir a fonte enquanto não for respondida.
- [ ] **Step 6: `PiecesPuzzle`.** Ao abrir uma evidência com `puzzle: "pieces"` ainda não montada:
  - grade 3×2 com a imagem da evidência (`background-position`), escala `pixelated`;
  - clique ou toque em duas peças para trocar; setas movem o foco e Enter/Espaço seleciona e troca;
  - `aria-live` diz "Peça N no lugar certo. Faltam M.";
  - "Pular" depois de 60 s;
  - ao terminar, chama `finishPieces` e mostra o documento.
  - Reduzir movimento: sem animação de troca.
- [ ] **Step 7:** Correções menores da crítica na cena e no visualizador:
  - etiquetas do modo "mostrar áreas" sem sobreposição (posicionar a etiqueta dentro do hotspot, alinhada ao topo, com `max-width` do hotspot e quebra);
  - carimbo ARQUIVADO abaixo do cabeçalho;
  - foco inicial no título do diálogo;
  - modal "Observação" com moldura pixel.
- [ ] **Step 8:** Conteúdo dos enigmas nos 6 casos (público e privado). Os textos seguem as fontes já conferidas do caso, e as perguntas de fonte se respondem lendo a própria carta.
  - **Época** (4 opções; a certa marcada com ✓):

    | Caso | Opções |
    |---|---|
    | demo | "Começo de 1923" ✓ · "1898" · "1950" · "1880" |
    | abolicao | "Por volta de 1500" · "Por volta de 1790" · "Por volta de 1880" ✓ · "Por volta de 1940" |
    | caminha | "Por volta de 1500" ✓ · "1790" · "1880" · "1940" |
    | inconfidencia | "1500" · "Por volta de 1790" ✓ · "1880" · "1940" |
    | vargas | "1500" · "1790" · "1880" · "Por volta de 1940" ✓ |
    | revolucao-industrial | "Por volta de 1500" · "Por volta de 1800" ✓ · "Por volta de 1900" · "Por volta de 1950" |

    Pergunta: "Pelas fontes que você já guardou, em que época você está?". Na demo: "Em que ano se passa esta história?".
  - **Peças:**

    | Caso | Fonte em peças |
    |---|---|
    | demo | `croqui` |
    | abolicao | `missa-campal` |
    | caminha | `terra-brasilis` |
    | inconfidencia | `bandeira-plano` |
    | vargas | `posse-1930` |
    | revolucao-industrial | `chadwick` |

  - **Perguntas de fonte** (3 opções, explicação curta, a certa ✓):

    | Caso | Fonte | Pergunta | Opções |
    |---|---|---|---|
    | demo | `recibo-encadernacao` | "O que foi para a oficina?" | Livro de Empréstimos ✓ / Livro de Terras / Livro de visitas |
    | demo | `oficio-prefeitura` | "Quem assina o ofício?" | O Prefeito ✓ / A agrimensora / O bibliotecário |
    | abolicao | `ventre-livre` | "Quem a lei tornava livre?" | Os filhos de mulher escravizada nascidos a partir dela ✓ / Todos os escravizados / Os maiores de 60 anos |
    | abolicao | `sexagenarios` | "O que os libertados ainda tinham de fazer?" | Trabalhar 3 anos para os antigos senhores ✓ / Pagar um imposto / Sair do país |
    | caminha | `partida` | "Para quem o autor escreve?" | Para o rei ✓ / Para a esposa / Para um padre |
    | caminha | `missa-cruz` | "De onde a carta foi escrita?" | Porto Seguro ✓ / Lisboa / Calicute |
    | inconfidencia | `quinto` | "Que parte do ouro ficava com a Coroa?" | A quinta parte ✓ / A metade / Todo o ouro |
    | inconfidencia | `sentenca` | "A que pena Tiradentes foi condenado?" | À forca ✓ / Ao exílio na África / À prisão por 10 anos |
    | vargas | `codigo-eleitoral` | "Quem passou a poder votar?" | Homens e mulheres maiores de 21 anos ✓ / Só homens / Todos com mais de 16 anos |
    | vargas | `constituicao-1937` | "O que o artigo 178 fez?" | Fechou o Congresso e as assembleias ✓ / Criou a CLT / Deu voto às mulheres |
    | revolucao-industrial | `sadler` | "Com que idade o operário começou na fábrica?" | 8 anos ✓ / 14 anos / 21 anos |
    | revolucao-industrial | `factory-act` | "O que a lei criou para fiscalizar as fábricas?" | Inspetores ✓ / Sindicatos / Escolas técnicas |

    A explicação de cada uma cita a frase da fonte em que está a resposta.
- [ ] **Step 9:** `pnpm test`, `pnpm build`, `pnpm check:leaks`: PASS. Jogar o tutorial no `pnpm dev` só com teclado, do cadeado às peças. Commit `Cena com HUD único e os quatro enigmas`.

### Task 9: Linha do tempo como tabuleiro

**Files:**
- Modify: `components/timeline/TimelineView.tsx`, `PlacedCard.tsx`, `LinksPanel.tsx`, `CheckPanel.tsx`, `lib/strings/pt-BR.ts`

**Interfaces:**
- Consumes: `lib/game/timeline.ts` (sem mudanças), `GameHud`.
- [ ] **Step 1: Carta posicionada compacta.**
  - Uma linha de no máximo 72 px: número da posição, miniatura 48×36, título, data (ou "sem data"), ↑ e ↓, e o botão "Abrir".
  - "Abrir" expande no lugar: certeza, "Por que está aqui?", "Junto com a de cima", "Separar", "Fora da história", "Devolver ao caderno" e "Ver a fonte" (abre o `DocumentSheet` num `Dialog`).
  - Uma carta aberta por vez.
- [ ] **Step 2: Caderno lateral.** Cada carta mostra os botões "No fim" e "No começo", mais "Fora da história". O `<select>` sai, e o "depois de…" vai para o menu da carta já posicionada.
- [ ] **Step 3: Abas acima do tabuleiro: "Ordem" e "Ligações".** "Ligações" só aparece com 2 ou mais cartas na linha. "Começo" e "Fim" viram marcos neutros (fundo `--sky-deep` ou papel com ícone de bandeira), sem `--ribbon`.
- [ ] **Step 4: Estado vazio** com o botão "Ir para a cena" (`lastSceneId ?? startSceneId`). Os textos longos ficam com `max-w-prose`.
- [ ] **Step 5: Critério.** Com as 7 cartas do tutorial posicionadas e nenhuma aberta, a coluna da linha cabe em 768 px de altura no desktop. Conferir com uma captura. Os testes atuais de `timeline.test.ts` passam sem mudança.
- [ ] **Step 6:** Commit `Linha do tempo compacta, com ligações em aba própria`.

### Task 10: Conclusão por escolha, placar e jogar de novo

**Files:**
- Modify: `components/resolution/ResolutionView.tsx`, `components/resolution/ClosureView.tsx`, `app/casos/[slug]/conclusao/page.tsx`, `app/casos/[slug]/encerramento/page.tsx`, `lib/strings/pt-BR.ts`
- Create: `components/resolution/Scoreboard.tsx`

**Interfaces:**
- Consumes: `submitChoice`, `getResult`, `restartCase` (Task 3); `resetProgress` (Task 4); `StarRating` (Task 5).
- [ ] **Step 1: Conclusão.**
  - pergunta do caso;
  - linha do tempo do aluno, só leitura e compacta;
  - 4 alternativas como cartões grandes de rádio (`role="radiogroup"`, setas);
  - campo "Justifique em uma frase (vale pontos extras)", opcional;
  - "Escolhas restantes: N de 2";
  - confirmação antes de gastar a última;
  - errar mostra o `feedback` daquela alternativa e a desabilita.
  - Sem o texto livre antigo.
- [ ] **Step 2: `Scoreboard`** no topo do encerramento:
  - `StarRating` grande;
  - pontos totais;
  - lista do `breakdown` com os rótulos em `strings` ("Resposta", "Ordem dos acontecimentos", "Justificativa", "Época", "Cadeados", "Peças", "Perguntas sobre as fontes", "Conferências usadas");
  - em treino, o título "Treino" e a linha "Seu resultado oficial: ★★☆ · 820 pontos".
  - Anúncio por `aria-live` ao carregar.
- [ ] **Step 3: "Jogar de novo"** no fim do encerramento. Confirma ("Você vai recomeçar este caso para treinar. Seu resultado oficial continua o mesmo."), chama `restartCase` e `resetProgress(slug, true)`, e vai para o briefing.
- [ ] **Step 4:** Grava `official` no progresso local quando `getResult` devolver, para Fases e HUD. Remover as 3 medalhas das Fases: elas continuam só no encerramento.
- [ ] **Step 5:** Trocar as `border-l-4` apontadas pelo detector (`ClosureView.tsx:125`, `ResolutionView.tsx:202` e `:229`, `CheckPanel.tsx:84`, `TimelineView.tsx:156`) por caixas com moldura pixel completa e ícone.
- [ ] **Step 6:** Jogar um caso inteiro no `pnpm dev`: errar a 1ª escolha, acertar a 2ª, ver o placar, jogar de novo, ver "Treino" e as Fases com o resultado oficial. Commit `Conclusão por escolha, placar com estrelas e jogar de novo`.

### Task 11: Documentos, verificação e publicação

**Files:**
- Modify: `PRODUCT.md`, `DECISOES.md`, `PROGRESSO.md`, `README.md` (se citar tentativas de texto), `app/creditos/page.tsx` (tirar "a definir")

- [ ] **Step 1:** `DECISOES.md`: nova decisão "D15 — Escolha com justificativa e pontuação (27/10/2026)", com o porquê, a tabela de pontos, as estrelas e "jogar de novo vale a 1ª".
- [ ] **Step 2:** `PRODUCT.md`: troca o diferencial (ver spec, "Documentos do projeto") e acrescenta a referência visual (jogos 2D coloridos, arte original).
- [ ] **Step 3:** `PROGRESSO.md`: nova seção com o que foi feito e o roteiro de teste manual.
- [ ] **Step 4:** `pnpm verify`. Esperado: lint, tipos, testes, build e "Nenhum vazamento".
- [ ] **Step 5:** Rodar `/impeccable critique` de novo (opcional) e comparar com 22/40.
- [ ] **Step 6:** Commit `Documentos do jogo colorido com enigmas e pontos` e deploy com `vercel deploy --prod --yes`. O `GAME_SECRET` precisa existir na Vercel; se não existir, avisar o dono antes.
