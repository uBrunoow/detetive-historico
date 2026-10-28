# Noir 16-bit e veredito "época + ordem": plano de implementação

> Substitui as Tasks 5–10 de `2026-10-27-jogo-colorido-enigmas-pontos.md` na parte visual (o "colorido" virou noir, aprovado no mockup `public/mockup/index.html` em 28/10/2026) e na pontuação (D20 sai, entra D21). Enigmas, cadeados, peças e perguntas sobre a fonte continuam como estão, sem pontos.

**Objetivo:** o veredito passa a ser duas coisas: a época da história (5 alternativas, A a E) e a ordem cronológica dos fatos. 100% só com as duas certas. O jogo inteiro ganha o visual noir do mockup.

## Regras (D21)

| Item | Pontos |
|---|---|
| Época certa | 400 |
| Ordem | `round(600 × ordem)`, ordem = (cartas "ordered" + "correctlyOutside") ÷ total da referência |
| Total | 1000 = 100% |

- Estrelas: ★★★ = 1000; ★★ ≥ 600; ★ > 0.
- Desfecho: `solved` com 600 pontos ou mais, senão `failed` (o caso fica "em aberto" na fala, nunca "você falhou").
- Um veredito por partida. "Jogar de novo" continua: recomeça em treino e o oficial é o 1º.
- A conferência da ordem continua dando só pistas (nunca qual carta está errada) e não tira pontos.
- Nada da resposta no navegador antes do encerramento: a época certa fica em `solution.json` (`epochAnswer`). Os campos públicos que entregavam a época saem: `period` e `timeline.startLabel/endLabel`.

## Tarefas

1. **Formato do caso.** `epochOptions` (5 × `{ title, years }`) obrigatório no público; `epochAnswer` (0–4) obrigatório no privado. Saem `epochGuess`, `conclusion`, `choiceAnswer`, `period`, `timeline`. `checkCaseBundle` confere o índice. Conteúdo dos 6 casos, alternativas em ordem cronológica.
2. **Pontuação e estado assinado v3.** `ScoreBreakdown = { epoch, order }`. Estado v3 sem escolhas/justificativa/palpite de época; guarda `epochChoice`. Tokens v1/v2 viram estado novo.
3. **Server Actions.** Saem `guessEpoch`, `submitAnswer`, `submitChoice`. Entra `submitVerdict(slug, { epochIndex, order })`, com o mesmo mínimo de cartas. `getClosure` devolve também as alternativas, a certa e a escolhida.
4. **Telas do veredito.** `/conclusao` vira o veredito: blocos A–E e a linha do jogador, confirmação e envio. Encerramento com placar de época + ordem, estrelas e carimbo. Sai o palpite de época da cena.
5. **Visual noir.** Tokens, fontes (Jersey 10 para UI pixel, Jacquard 24 só no letreiro), mundo noturno (céu em faixas, estrelas, chuva, neblina, chão de pedra), botões sangue/âmbar/pergaminho, painéis dossiê, sprites em SVG (detetive, poste, lua, alfinetes), abertura em íris, home e fases como no mockup. Movimento respeita "reduzir movimento".
6. **Testes, documentos e verificação.** Testes atualizados, `DECISOES.md` (D21), `PRODUCT.md`, `PROGRESSO.md`, `DESIGN.md`; `pnpm verify`; capturas 1366×768 e 390×844.
