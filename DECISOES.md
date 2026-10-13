# Decisões

Decisões tomadas onde o PRD ou o prompt de implementação deixavam algo em aberto, ou onde nos afastamos deles.

## D1 — Sem banco de dados no MVP (13/10/2026)

O prompt pedia Supabase. Decidimos pelo **MVP mais simples possível**:

- **Casos** são arquivos JSON versionados (`content/cases/<slug>/`). Atende "casos são dados, não código" e facilita a revisão por historiadores (diff no git).
- **Conteúdo privado** (`solution.json`) só é lido no servidor (`lib/content/private.ts`, marcado `server-only`) por Server Actions. Nada da solução vai para o navegador antes do encerramento; `pnpm check:leaks` verifica o build.
- **Progresso do jogador** fica no `localStorage`, atrás de uma interface própria, para poder trocar por um banco depois sem mexer no jogo.
- **Contadores** (tentativas e conferências) sobrevivem a recarregar, fechar a aba e sair e voltar ao caso, como pede o PRD §5.9. Eles não resistem a quem apaga os dados do site de propósito. Isso também aconteceria com login anônimo; só contas reais resolveriam. A partir da Fase 4, os contadores e a liberação do encerramento são assinados pelo servidor (HMAC com `GAME_SECRET`), para que editar o `localStorage` não reabra tentativas nem libere a solução.
- **Fora do MVP por consequência:** continuidade entre dispositivos, painel do professor e métricas de aprendizagem (RF-20/RF-21). Quando entrarem, entra um banco.

## D2 — Conferência da linha do tempo (RF-11) entra no MVP

O PRD a marca como "a confirmar"; o prompt a coloca na Fase 4. Seguimos o prompt.

## D3 — Respostas aceitas além dos grupos de conceitos

O PRD §5.9 pede "variações de respostas aceitas". `solution.json` tem `acceptedVariants` (respostas inteiras, comparadas já normalizadas) além dos `conceptGroups`.

## D4 — Contador "itens relevantes não descobertos"

Conta **todas as evidências coletáveis** ainda não coletadas, e não só as que pertencem à história. Contar só as relevantes deixaria deduzir quantas cartas são irrelevantes.

## D5 — Evidências são públicas

O conteúdo das evidências (inclusive as que estão atrás de objetos bloqueados) faz parte do arquivo público. Elas são fontes, não a solução; o que é privado é a interpretação (ordem, marcos, relevância, datação, solução).

## D6 — Dicas da conferência

Cada dica tem `level` e `condition` (`milestone_missing`, `irrelevant_between_milestones`, `milestones_inverted` com o par, `default`). Na conferência N, usa-se a condição de maior prioridade que se aplica (na ordem acima) e, dentro dela, a dica de maior nível ≤ N; se não houver, a de menor nível.

## D7 — Mundo visual "Repartição datilografada"

Escolhido pelo responsável entre as direções apresentadas. Fontes históricas em Courier Prime (serifada, de caráter documental, como pede o prompt), texto corrido em Atkinson Hyperlegible Next (feita para legibilidade). Azul-carbono é reservado ao foco do jogador; o roxo de carimbo é a voz do sistema. O contraste AA dos pares de tokens é testado em `tests/unit/contrast.test.ts`, nos dois modos.

## D8 — Público e dispositivo de referência

Fundamental (anos finais) e Médio, jogando em laboratório de informática da escola. A linguagem segue a faixa mais nova; o desempenho mira computadores modestos.
