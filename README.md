# Detetive Histórico

Jogo web 2D de investigação histórica: o jogador explora uma cena, coleta evidências que viram cartas, organiza as cartas numa linha do tempo, resolve enigmas opcionais e dá o veredito: a época da história (A a E) e a ordem dos fatos. Época certa vale 400 pontos, a ordem até 600; 100% só com as duas. O encerramento preserva o primeiro resultado e permite treinar novamente. Requisitos em [`PRD.md`](PRD.md).

MVP propositalmente simples: **sem banco de dados**. Os casos são arquivos no repositório e o progresso do jogador fica no navegador (ver [`DECISOES.md`](DECISOES.md)).

## Como rodar

Requisitos: Node 20+ e pnpm.

```bash
pnpm install
cp .env.example .env.local   # e troque GAME_SECRET
pnpm dev                     # http://localhost:3000
```

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm test` | Testes unitários (Vitest), incluindo a validação de todos os casos |
| `pnpm lint` / `pnpm typecheck` | ESLint e TypeScript |
| `pnpm build && pnpm check:leaks` | Build de produção e verificação de que nenhum texto da solução foi parar no que o navegador recebe |
| `pnpm verify` | Tudo acima, em sequência |

## Como adicionar um caso

Um caso é uma pasta, sem alterar código:

```
content/cases/<slug>/
  case.json       conteúdo público: cenas, objetos, evidências, briefing, configurações
  solution.json   conteúdo privado: ordem de referência, marcos-chave, dicas, relações, solução
public/cases/<slug>/
  *.svg|*.jpg|*.png  capa, fundos das cenas e imagens das evidências
```

1. Copie `content/cases/demo-biblioteca/` e `public/cases/demo-biblioteca/` com um novo slug (letras minúsculas, números e hífens).
2. Edite `case.json` e `solution.json`. O formato está documentado em [`lib/content/schema.ts`](lib/content/schema.ts).
   - Hotspots usam porcentagens (`x`, `y`, `w`, `h` de 0 a 100) relativas à imagem da cena, então qualquer ilustração serve.
   - `status: "draft"` esconde o caso do catálogo.
3. Rode `pnpm test`. O teste valida os dois arquivos e a coerência entre eles (critérios do PRD §7): toda evidência pode ser encontrada numa cena, toda carta sem data tem explicação de datação, há de 2 a 4 marcos-chave sem empate, existem dicas `default`, as imagens existem etc. A mensagem de erro diz o que corrigir.

> **Nunca** coloque informação que revele a solução em `case.json`: ele vai para o navegador. O schema é estrito e rejeita os campos privados, e `pnpm check:leaks` confere o build.

## Estrutura

```
app/                rotas (Next.js App Router)
content/cases/      casos (dados)
lib/content/        leitura e validação dos casos (public.ts → navegador; private.ts → só servidor)
lib/strings/        textos da interface em pt-BR
public/cases/       imagens dos casos
scripts/            check-leaks.mjs
tests/unit/         Vitest
```
