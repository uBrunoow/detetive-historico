# Caso "A lei de dois artigos" — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar o caso real `abolicao` (fim da escravidão no Brasil, 1871–1888), jogável de ponta a ponta com 7 cartas de fontes reais.

**Architecture:** O caso é só conteúdo: `content/cases/abolicao/case.json` + `solution.json`, no formato de `lib/content/schema.ts`. A arte vem de um script novo no motor de pixel art existente (`scripts/pixel-art/engine.mjs`). Nenhuma mudança no código do jogo. Os slugs são ordenados alfabeticamente (`lib/content/files.ts`), então `abolicao` aparece antes de `demo-biblioteca` em /fases sem nenhuma mudança.

**Tech Stack:** Next.js 16, Zod 4, Vitest, Node (scripts `.mjs`), Playwright (só para captura de tela).

**Spec:** `docs/superpowers/specs/2026-10-20-caso-abolicao-design.md`

## Global Constraints

- Todo texto entre aspas ou em `transcription` existe no original. As transcrições abaixo foram conferidas e devem ser copiadas **sem alteração** (grafia de época incluída).
- Textos da equipe (`description`, `back`, `briefing`, contextos, dicas, feedbacks): frases curtas para 11 anos, tom acolhedor ("revise", "observe"), "pessoas escravizadas" na voz da equipe.
- A carta de Nabuco **não tem `date`**, e nenhum campo dela pode conter "1883".
- Nenhuma imagem de violência ou de corpos de pessoas escravizadas: a arte mostra lugares e objetos.
- `fictional: false`, `status: "published"`, `difficulty: "medium"`, `durationMinutes: 30`, `minCardsToResolve: 4`, `maxTimelineChecks: 3`, `maxAttempts: 5`.
- Cenas 320×200 px. Hotspot em % = coluna ÷ 3,2 e linha ÷ 2 (mesma grade do demo).
- `pnpm verify` passa no fim.

## Review Focus

1. **Resposta que diz "a lei" sem falar em gradual nem pressão** (ex.: "A lei do Ventre Livre libertou todos os escravos"): não pode ser aceita. Por isso o grupo `lei-final` **não** tem o sinônimo solto "lei". Teste na Task 2.
2. **Resposta que nega o erro comum** ("não foi bondade da princesa, foi a pressão dos abolicionistas e aconteceu aos poucos"): deve ser aceita. Teste na Task 2.
3. **Lei de 1850 posta entre os marcos**: a conferência devolve a dica `irrelevant_between_milestones`, não "ok". Teste na Task 2.
4. **Nabuco posto depois de 1885**: isso não pode gerar dica, porque ele não é marco-chave. Teste na Task 2.
5. **Data da carta sem data vazando** no payload público: nenhum campo da evidência `nabuco` contém "1883". Teste na Task 2.

---

### Task 1: Arte do caso

**Files:**
- Create: `scripts/pixel-art/abolicao.mjs`
- Create (gerados): `public/cases/abolicao/{cover,scene-redacao,scene-escritorio}.png` e `public/cases/abolicao/ev-{lei-1850,ventre-livre,nabuco,sexagenarios,clube-militar,lei-aurea,missa-campal}.png`

**Interfaces:**
- Consumes: `Canvas` e `PALETTE` de `scripts/pixel-art/engine.mjs`. Siga os padrões de `demo-biblioteca.mjs`: `wall`, `floorBoards`, `books`, `thumb(name, drawFn)`, `savePng`.
- Produces: os PNGs acima e as caixas dos objetos (em px) abaixo, que a Task 2 converte em hotspots.

Caixas dos objetos (x, y, w, h em px da grade 320×200). Cada objeto precisa estar desenhado dentro da sua caixa.

**Cena `redacao`** (redação de jornal, Rio, 1888; dia, janela clara):
| id | caixa | o que desenhar |
|---|---|---|
| `janela-rua` | 16, 20, 64, 60 | janela aberta com bandeirolas e fitas lá fora |
| `parede-recortes` | 104, 24, 64, 48 | quadro com uma cena de multidão ao ar livre e um altar (ilustração da missa, sem rostos detalhados) |
| `mesa-redator` | 24, 108, 120, 34 | mesa com uma folha impressa curta e um tinteiro |
| `gaveta-redacao` | 36, 146, 44, 18 | gaveta da mesa com fechadura |
| `pilha-jornais` | 176, 128, 44, 40 | pilha de jornais com o título "CIDADE DO RIO" legível |
| `prelo` | 236, 80, 72, 96 | prensa tipográfica (decorativa) |

**Cena `escritorio`** (escritório de advogado; luminária, tons escuros):
| id | caixa | o que desenhar |
|---|---|---|
| `colecao-1850` | 24, 36, 30, 44 | volume grosso de lombada vermelha "LEIS 1850" |
| `colecao-1871` | 58, 36, 30, 44 | volume de lombada verde "LEIS 1871" |
| `colecao-1885` | 92, 36, 30, 44 | volume de lombada violeta "LEIS 1885" |
| `livro-nabuco` | 140, 112, 48, 22 | livro aberto sobre a mesa |
| `chaveiro` | 204, 96, 18, 28 | gancho na parede com uma chave pequena |
| `retrato-gama` | 232, 24, 36, 48 | retrato emoldurado (busto, sem caricatura) |
| `retrato-reboucas` | 276, 24, 36, 48 | retrato emoldurado (busto) |

**Miniaturas das cartas:**
- três folhas de lei com brasão simples (`lei-1850`, `ventre-livre`, `sexagenarios`, `lei-aurea`; a `lei-aurea` com só duas linhas de texto);
- livro aberto (`nabuco`);
- carta dobrada com lacre (`clube-militar`);
- multidão e altar ao ar livre (`missa-campal`).

**Capa:** a folha da lei de 1888 sobre a mesa com fitas de festa.

- [ ] **Step 1:** Escrever `scripts/pixel-art/abolicao.mjs` com uma função por cena, `cover()` e `evidenceThumbs()`. Saída em `public/cases/abolicao/`.
- [ ] **Step 2:** Rodar `node scripts/pixel-art/abolicao.mjs`. Esperado: 10 PNGs criados, sem erro.
- [ ] **Step 3:** Abrir as duas cenas com a ferramenta Read e conferir que cada objeto está dentro da sua caixa e é reconhecível.
- [ ] **Step 4:** Commit: `git add scripts/pixel-art/abolicao.mjs public/cases/abolicao && git commit -m "Arte em pixel do caso da abolição"`

---

### Task 2: Conteúdo do caso e testes

**Files:**
- Create: `content/cases/abolicao/case.json`
- Create: `content/cases/abolicao/solution.json`
- Create: `tests/unit/abolicao.test.ts`

**Interfaces:**
- Consumes: os PNGs e as caixas da Task 1; `getPublicCase`/`getPrivateCase` (`lib/content/public.ts`, `private.ts`); `evaluateAnswer(solution, text)` (`lib/game/answer.ts`); `checkTimeline(priv, {slots, outside}, checkNumber)` (`lib/game/check.ts`).
- Produces: o caso `abolicao` publicado.

**Evidências** (`id` · `code` · `date` · cena/objeto · `presentation`):

| id | code | date (`iso` / `label`) | objeto | presentation |
|---|---|---|---|---|
| `lei-1850` | ES-01 | 1850-09-04 / "4 de setembro de 1850" | `colecao-1850` | typed, office, heading "Lei nº 581" |
| `ventre-livre` | ES-02 | 1871-09-28 / "28 de setembro de 1871" | `colecao-1871` | typed, office, heading "Lei nº 2.040" |
| `nabuco` | ES-03 | — (sem data) | `livro-nabuco` | printed, aged, heading "O Abolicionismo" |
| `sexagenarios` | ES-04 | 1885-09-28 / "28 de setembro de 1885" | `colecao-1885` | typed, office, heading "Lei nº 3.270" |
| `clube-militar` | RE-01 | sem `iso` / "Outubro de 1887" | `gaveta-redacao` (locked, `requiresExamined: ["chaveiro"]`) | drawing (sem transcription) |
| `lei-aurea` | RE-02 | 1888-05-13 / "13 de maio de 1888" | `mesa-redator` | typed, office, heading "Lei nº 3.353" |
| `missa-campal` | RE-03 | 1888-05-17 / "17 de maio de 1888" | `parede-recortes` | drawing (sem transcription) |

**Transcrições** (copiar exatamente; `\n` separa parágrafos):

- `lei-1850`: `Estabelece medidas para a repressão do trafico de africanos neste Imperio.` A Task 2 pode acrescentar o Art. 1º, **desde que** copiado do Planalto (LIM581.htm) e conferido.
- `ventre-livre`: `A Princeza Imperial Regente, em nome de Sua Magestade o Imperador e Senhor D. Pedro II, faz saber a todos os subditos do Imperio que a Assembléa Geral Decretou e ella Sanccionou a Lei seguinte:\nArt. 1º Os filhos de mulher escrava que nascerem no Imperio desde a data desta lei, serão considerados de condição livre.\nDada no Palácio do Rio de Janeiro, aos vinte e oito de Setembro de mil oitocentos setenta e um.\nPRINCEZA IMPERIAL REGENTE`
- `nabuco`: `A alforria como doação é uma esperança que todo o escravo póde ter, mas que é a sorte relativamente de muito poucos.\nTome-se a generalidade dos nossos escravos: morrem no captiveiro; os libertos sempre foram excepções.\nPonha-se de lado essa esperança de que o senhor lhe dê a liberdade, esperança que não constitue um direito; que porta ha na lei para o escravo sahir do captiveiro? A lei de 28 de Setembro de 1871 abriu-lhe, mas não facilitou-lhe, dois caminhos: o do resgate forçado pelo peculio, e o do sorteio annual.`
- `sexagenarios`: `D. Pedro II, por Graça de Deus e Unanime Acclamação dos Povos, Imperador Constitucional e Defensor Perpetuo do Brazil: Fazemos saber a todos os Nossos subditos que a Assembléa Geral Decretou e Nós Queremos a Lei seguinte:\n§ 10. São libertos os escravos de 60 annos de idade, completos antes e depois da data em que entrar em execução esta Lei; ficando, porém, obrigados, a titulo de indemnização pela sua alforria, a prestar serviços a seus ex-senhores pelo espaço de tres annos.\nDada no Palacio do Rio de Janeiro aos 28 de Setembro de 1885.\nIMPERADOR`
- `lei-aurea`: `A Princeza Imperial Regente, em Nome de Sua Magestade o Imperador o Senhor D. Pedro II, Faz saber a todos os subditos do Imperio que a Assembléa Geral decretou e Ella sanccionou a Lei seguinte:\nArt. 1.° E’ declarada extincta, desde a data desta Lei, a escravidão no Brazil.\nArt. 2.° Revogam-se as disposições em contrario.\nDada no Palacio do Rio de Janeiro em 13 de maio de 1888, 67º da Independencia e do Imperio.\nPRINCEZA IMPERIAL REGENTE.\nRodrigo Augusto da Silva`

**Fatos fixos para os textos da equipe** (use estes e nenhum outro fato não conferido):
- `nabuco`: author "Joaquim Nabuco"; provenance "Trecho de um livro de Joaquim Nabuco, abolicionista. A página com a data de publicação não está aqui." `back` em português atual: para sair da escravidão, a lei só oferecia comprar a liberdade com as próprias economias ou ganhar um sorteio, e quase todos morriam escravizados.
- `sexagenarios`, no verso: assinada por D. Pedro II; os libertos com 60 anos ou mais ainda tinham de trabalhar 3 anos para os antigos senhores.
- `ventre-livre`, no verso: livres só os filhos nascidos depois da lei; o senhor podia usar o trabalho deles até os 21 anos (§ 1º).
- `lei-1850`, no verso: proibia trazer africanos escravizados pelo mar; não libertou quem já estava escravizado.
- `clube-militar`: sourceType "Pedido (descrição da equipe)". Description: "O Clube Militar, presidido pelo marechal Deodoro da Fonseca, pediu à Princesa Regente que o Exército não fosse mais usado para capturar pessoas escravizadas que fugiam. Naquele ano, as fugas eram tantas que os fazendeiros pediam ajuda ao governo." Provenance: "O texto original deste pedido ainda não foi localizado pela equipe; esta carta resume o que ele pedia."
- `missa-campal`: sourceType "Ilustração da equipe". Description: "Ilustração feita pela equipe do jogo, inspirada na fotografia de Antonio Luiz Ferreira (acervo do Instituto Moreira Salles). A foto mostra a missa ao ar livre no Campo de São Cristóvão, no Rio de Janeiro, celebrada em agradecimento pela abolição, com a presença da princesa Isabel e de uma multidão."
- Contexto `pilha-jornais`: José do Patrocínio (1853–1905), jornalista negro, dono do jornal *Cidade do Rio* e um dos líderes da campanha abolicionista.
- Contexto `retrato-gama`: Luiz Gama (1830–1882) nasceu livre na Bahia e foi vendido como escravizado aos 10 anos. Conquistou a liberdade, tornou-se advogado e libertou nos tribunais centenas de pessoas. Morreu em 1882, antes da abolição.
- Contexto `retrato-reboucas`: André Rebouças (1838–1898), engenheiro negro e abolicionista, defendia que os libertos recebessem terras para trabalhar.
- Contexto `janela-rua`: desde 13 de maio a cidade comemora nas ruas.
- Contexto `chaveiro`: uma chave pequena com a etiqueta "gaveta da redação". O `lockedMessage` da gaveta aponta para "o escritório".
- Decorativo: `prelo`.

**Caso:**
- `slug`: "abolicao"; `title`: "A lei de dois artigos"
- `period`: "1871 a 1888"; `place`: "Rio de Janeiro, Império do Brasil"
- `audience`: "Anos finais do Ensino Fundamental e Ensino Médio"
- `question`: "Como e por que a escravidão terminou no Brasil?"
- `startSceneId`: "redacao"
- `timeline`: startLabel "28 de setembro de 1871 — Lei do Ventre Livre", endLabel "Maio de 1888 — festas da abolição no Rio"
- O `briefing` inclui o aviso: "Os lugares e o personagem são uma reconstrução. Os documentos são reais, e cada um indica de onde veio."
- `references`: as 7 entradas da spec ("Referências"), com `kind: "source"`, mais `{kind: "credit", text: "Ilustrações em pixel feitas pela equipe; a missa campal é inspirada na fotografia de Antonio Luiz Ferreira (IMS)."}`.

**solution.json:**
- `timelineReference`, como referenceOrder / belongsToStory / isKeyMilestone:
  - `ventre-livre`: 1 / sim / ✓
  - `nabuco`: 2 / sim / ✗, com `datingClueExplanation` da spec
  - `sexagenarios`: 3 / sim / ✓
  - `clube-militar`: 4 / sim / ✗
  - `lei-aurea`: 5 / sim / ✓
  - `missa-campal`: 6 / sim / ✗
  - `lei-1850`: null / não / ✗, com `outsideReason` da spec
- `timelineHints`: os 4 textos da spec, com level 1 (`milestone_missing`, `irrelevant_between_milestones`, `milestones_inverted` pair `["ventre-livre","sexagenarios"]`, `default`). Acrescentar uma de level 2 para o par invertido: "A lei do Ventre Livre veio primeiro: ela pensava nas crianças que iam nascer."
- `evidenceRelations`: as 4 da spec (`ventre-livre`→`sexagenarios` consequence_of invertido para `from: sexagenarios, to: ventre-livre, type: consequence_of`; `nabuco` mentions `ventre-livre`; `clube-militar` caused `lei-aurea`; `missa-campal` consequence_of `lei-aurea`).
- `conceptGroups` (minGroupsToAccept 2):
  - `gradual`: ["aos poucos", "gradual", "gradualmente", "lento", "lentamente", "leis anteriores", "ventre livre", "sexagenarios", "1871", "1885"]
  - `pressao`: ["abolicionistas", "abolicionista", "pressao", "pressionaram", "luta", "lutaram", "fugas", "fugiram", "fuga", "quilombos", "resistencia", "campanha", "jornais", "imprensa", "movimento"]
  - `lei-final`: ["lei aurea", "13 de maio", "1888", "princesa isabel", "abolicao"]. **Sem "lei" solto.**
- `acceptedVariants`: []
- `partialAnswers`: os 2 da spec (`["lei-final"]`, `["gradual"]`) e mais `["pressao"]`, com o feedback: "Você viu a pressão. E o que o governo fez antes, aos poucos, e no fim?"
- `commonErrors`:
  - `["bondade", "presente", "boazinha", "bondosa", "generosa", "generosidade"]`, com o feedback da spec;
  - `["libertou todos", "libertou todo mundo"]`, com o feedback da spec sobre o art. 1º de 1871.
- `referenceAnswer`, `explanation` e `sourceLimitations`: textos da seção "Solução" da spec.
- `defaultPartialFeedback` e `defaultRejectedFeedback`: no tom do demo, apontando para as datas das leis e para quem pressionou.

- [ ] **Step 1: Escrever o teste com falha** `tests/unit/abolicao.test.ts`:

```ts
const pub = (await getPublicCase("abolicao"))!;
const priv = await getPrivateCase("abolicao");
const sol = priv.solution;
const ev = (id: string) => pub.evidence.find((e) => e.id === id)!;

it("transcrições conferidas", () => {
  expect(ev("lei-aurea").transcription).toContain("Art. 1.° E’ declarada extincta, desde a data desta Lei, a escravidão no Brazil.");
  expect(ev("sexagenarios").transcription).toContain("pelo espaço de tres annos");
  expect(ev("ventre-livre").transcription).toContain("serão considerados de condição livre");
  expect(ev("nabuco").transcription).toContain("o do resgate forçado pelo peculio, e o do sorteio annual");
});
it("Nabuco não tem data nem pista do ano no público", () => {
  expect(ev("nabuco").date).toBeUndefined();
  expect(JSON.stringify(ev("nabuco"))).not.toContain("1883");
});
it("aceita gradual + pressão", () =>
  expect(evaluateAnswer(sol, "A escravidão acabou aos poucos e por pressão dos abolicionistas e das fugas").verdict).toBe("accepted"));
it("aceita negando a bondade", () =>
  expect(evaluateAnswer(sol, "Não foi bondade da princesa, foi a pressão dos abolicionistas e aconteceu aos poucos").verdict).toBe("accepted"));
it("só a lei final é parcial", () =>
  expect(evaluateAnswer(sol, "A princesa Isabel assinou a Lei Áurea em 1888")).toMatchObject({ verdict: "partial", feedback: sol.partialAnswers[0].feedback }));
it("bondade recebe orientação", () =>
  expect(evaluateAnswer(sol, "A princesa Isabel acabou com a escravidão por bondade").feedback).toBe(sol.commonErrors[0].feedback));
it("Ventre Livre não liberta todos", () => {
  const r = evaluateAnswer(sol, "A lei do Ventre Livre libertou todos os escravos");
  expect(r.verdict).not.toBe("accepted");
  expect(r.feedback).toBe(sol.commonErrors[1].feedback);
});
it("linha certa confere ok; Nabuco depois de 1885 não gera dica", () => {
  const outside = ["lei-1850"];
  expect(checkTimeline(priv, { slots: [["ventre-livre"], ["nabuco"], ["sexagenarios"], ["clube-militar"], ["lei-aurea"], ["missa-campal"]], outside }, 1)).toEqual({ kind: "ok" });
  expect(checkTimeline(priv, { slots: [["ventre-livre"], ["sexagenarios"], ["nabuco"], ["lei-aurea"]], outside }, 1)).toEqual({ kind: "ok" });
});
it("lei de 1850 entre os marcos gera dica", () => {
  const r = checkTimeline(priv, { slots: [["ventre-livre"], ["lei-1850"], ["sexagenarios"], ["lei-aurea"]], outside: [] }, 1);
  expect(r).toEqual({ kind: "hint", text: priv.timelineHints.find((h) => h.condition.type === "irrelevant_between_milestones")!.text });
});
```

Atenção ao teste "só a lei final é parcial": a frase tem "Isabel" e "1888", que são do grupo `lei-final`. Confirme que nenhum sinônimo de `gradual` ou `pressao` casa com ela; se casar, ajuste os sinônimos, não o teste.

- [ ] **Step 2:** Rodar `pnpm vitest run tests/unit/abolicao.test.ts`. Esperado: FAIL (o caso não existe).
- [ ] **Step 3:** Escrever `case.json` e `solution.json` conforme as tabelas acima. Hotspots = caixas da Task 1 ÷ 3,2 (x, w) e ÷ 2 (y, h), arredondados para baixo em x/y e para cima em w/h, sem passar de 100.
- [ ] **Step 4:** Rodar `pnpm test`. Esperado: tudo PASS, incluindo `content.test.ts` (validação, coerência, imagens e vazamento) para `abolicao`.
- [ ] **Step 5:** Rodar `pnpm build && pnpm check:leaks`. Esperado: "Nenhum vazamento".
- [ ] **Step 6:** Commit: `git add content/cases/abolicao tests/unit/abolicao.test.ts && git commit -m "Caso real: a lei de dois artigos (abolição)"`

---

### Task 3: Conferência no navegador e documentação

**Files:**
- Modify: `PROGRESSO.md` (nova seção "Caso real 1 — abolição" com feito / como testar / pendências; corrigir as menções desatualizadas a "catálogo" e "SVG")
- Modify: `scripts/prototipo-pdf.mjs` (passar a capturar o briefing e uma cena do caso `abolicao`)

- [ ] **Step 1:** `pnpm start -p 3100` e jogar o caso pelo navegador (Playwright): abrir o briefing, examinar o chaveiro, abrir a gaveta, guardar as 7 cartas, montar a linha, conferir, enviar uma resposta aceita e abrir o encerramento. Esperado: nenhum erro no console, e o encerramento mostra referências e limites das fontes.
- [ ] **Step 2:** Capturar as cenas a 1366×800 e a 390×844 e conferir os hotspots sobre a arte (botão "Mostrar o que dá para examinar").
- [ ] **Step 3:** Atualizar `PROGRESSO.md` e o script do PDF, e regenerar `docs/prototipo-telas.pdf`.
- [ ] **Step 4:** `pnpm verify`. Esperado: lint, typecheck, testes, build e leaks passam.
- [ ] **Step 5:** Commit: `git add -A && git commit -m "Documenta o caso da abolição e atualiza o protótipo"`
