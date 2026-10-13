# Progresso

## Fase 0 — Fundação ✅ (aguardando revisão)

**Feito**
- Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind 4.
- Formato dos casos com Zod estrito (`lib/content/schema.ts`), leitores público e privado (`lib/content/public.ts`, `lib/content/private.ts`) e verificação de coerência editorial (`lib/content/check.ts`).
- Caso de demonstração fictício `demo-biblioteca`: 2 cenas, 12 objetos dos 5 tipos, 7 cartas (5 datadas, 2 sem data situáveis por indícios, 1 fora da história), 3 marcos-chave, dicas em 3 níveis, `minCardsToResolve = 4`, solução com 3 grupos de conceitos (mínimo 2), 1 resposta parcial e 2 erros comuns. Imagens em SVG feitas para o projeto.
- Tokens de design (cores com modo escuro, escada tipográfica, raios, sombras, alvo de toque) em `app/globals.css`.
- Textos de interface centralizados em `lib/strings/pt-BR.ts`.
- Testes: validação de todos os casos, separação público/privado, contraste AA dos tokens. `scripts/check-leaks.mjs` verifica o build (testado com um vazamento proposital, que foi detectado).
- `PRODUCT.md` (verdade do produto para o trabalho de design), `README.md`, `DECISOES.md`, `.env.example`.

**Como testar manualmente**
1. `pnpm install && pnpm dev` e abra http://localhost:3000: a página provisória lista o caso de demonstração.
2. `pnpm test`: 38 testes passam.
3. Quebre o caso de propósito (ex.: apague `datingClueExplanation` do `bilhete` em `solution.json`) e rode `pnpm test`: o erro aponta o problema.
4. `pnpm build && pnpm check:leaks`.

**Pendente / observações**
- A página inicial é provisória; o catálogo de verdade é a Fase 1.
- O aviso `Failed to find font override values for Atkinson Hyperlegible Next` no build é inofensivo (só desativa a fonte de fallback ajustada).

## Critérios de aceitação do PRD (§12)

- [ ] Iniciar uma investigação
- [ ] Explorar objetos
- [ ] Coletar evidências
- [ ] Montar a linha do tempo
- [ ] Justificar posições
- [ ] Relacionar cartas
- [ ] Montar sem arrastar
- [ ] Preservar progresso
- [ ] Liberar a resolução
- [ ] Enviar uma solução
- [ ] Limitar tentativas
- [ ] Apresentar feedback
- [ ] Explicar o caso
- [ ] Usar em dispositivos diferentes
