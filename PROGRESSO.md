# Progresso

## Fase 0 — Fundação ✅

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
2. `pnpm test`: os testes passam.
3. Quebre o caso de propósito (ex.: apague `datingClueExplanation` do `bilhete` em `solution.json`) e rode `pnpm test`: o erro aponta o problema.
4. `pnpm build && pnpm check:leaks`.

**Pendente / observações**
- A página inicial é provisória; o catálogo de verdade é a Fase 1.
- O aviso `Failed to find font override values for Atkinson Hyperlegible Next` no build é inofensivo (só desativa a fonte de fallback ajustada).

## Fase 1 — Catálogo, briefing e cena ✅ (aguardando revisão)

**Feito**
- **Catálogo** (`/`): capa, aviso de conteúdo fictício, pergunta, período, local, dificuldade, duração e situação (não iniciado / em andamento / concluído), lida do progresso salvo no navegador.
- **Briefing** (`/casos/[slug]`): ofício datilografado com carimbo "Caso aberto", pergunta investigativa, intervalo da investigação, como jogar e "Começar/Continuar a investigação" (volta à última cena visitada).
- **Cena** (`/casos/[slug]/cena/[sceneId]`): imagem com hotspots em porcentagem (alvo mínimo de 44 px), abas de lugar (pastas manila), "Mostrar o que dá para examinar", lista acessível dos objetos, estados examinado / trancado / no caderno em texto, contador de fontes ainda não descobertas. No celular a cena rola na horizontal.
- **Ambientação**: luz de luminária que acompanha o ponteiro e o foco do teclado; a luz "acende" (com uma piscada) ao entrar num lugar; desliga com movimento reduzido.
- **Documentos realistas** (`components/document/DocumentSheet.tsx`): ofício datilografado com timbre e carimbo, recibo com faixa vermelha, livro de visitas pautado, bilhete e ata manuscritos (com opção "letra de forma"), jornal com cabeçalho e colunas, croqui em papel envelhecido. Tudo a partir da transcrição.
- **Visualizador de evidência**: a fonte sobre a mesa, a ficha de catálogo (tipo, data quando houver, autoria, procedência, descrição, código de procedência) e um lembrete de que fonte não é fato. "Guardar no caderno" carimba "Arquivado" no papel e anuncia por `aria-live`.
- Objetos de leitura, contexto, decorativos e trancados com painéis próprios; a gaveta abre depois de examinar o chaveiro.
- Estados de carregamento ("Buscando no arquivo…") e 404 no tom do jogo.
- Progresso no `localStorage` (`lib/progress/store.ts`), regras puras de exploração testadas (`lib/game/scene.ts`).
- Estudo de referência do Carmen Sandiego no Google Earth: `docs/referencias/carmen-sandiego-google-earth.md`.

**Como testar manualmente**
1. `pnpm dev` e abra http://localhost:3000.
2. Abra o caso e clique em "Começar a investigação".
3. Na sala de leitura, passe o mouse pela cena (a luz acompanha) e use Tab para percorrer os objetos.
4. Abra os papéis da mesa e guarde no caderno: aparece o carimbo "Arquivado".
5. Tente a gaveta (trancada). Vá ao "Arquivo dos fundos", examine o chaveiro, volte e abra a gaveta. No bilhete, teste "Ler em letra de forma".
6. Recarregue a página e volte ao catálogo: o caso aparece "Em andamento" e os objetos continuam examinados.
7. Teste com 390 px de largura, no modo escuro e com "reduzir movimento" ativado no sistema.

**Pendente / observações**
- O caderno (Fase 2) ainda não existe: as cartas são guardadas, mas só aparecem no contador.
- ~~Imagens das cenas são marcadores de posição em SVG.~~ Substituídas por arte em pixel gerada por script (`scripts/pixel-art/`), junto com o menu com tela de título e a tela de fases com medalhas.

## Fase 2 — Caderno de investigação ✅ (aguardando revisão)

**Feito**
- **Caderno** (`components/notebook/Notebook.tsx`): botão "Caderno" no topo da cena abre o caderno por cima do lugar, sem sair dele (PRD §5.6). Três seções separadas em abas: **Fontes**, **Anotações** e **Hipóteses** (setas esquerda/direita trocam de aba).
- **Fontes**: cartas coletadas (frente com miniatura, título, tipo de fonte), importantes primeiro. Cada carta mostra se tem anotação e que ainda não está na linha do tempo.
- **Ficha (verso)**: tipo, data quando houver, autoria, procedência, descrição, texto do verso, "Marcar como importante" e anotações do jogador, salvas a cada tecla. "Ver a fonte completa" mostra o documento desenhado, com a opção de letra de forma.
- **Anotações**: anotações gerais do caderno e um resumo das anotações feitas nas fontes, com atalho para cada ficha.
- **Hipóteses**: criar, editar e apagar (com confirmação na própria linha). Cada uma leva a etiqueta "hipótese, não confirmada", e o texto de abertura diz que hipótese não é fato.
- Contador de fontes ainda não descobertas no caderno e atalho para a linha do tempo.
- Progresso ganhou `notes` e `hypotheses`; dados salvos antes continuam válidos (campos novos entram com valor vazio).
- Regras puras em `lib/game/notebook.ts`, testadas em `tests/unit/notebook.test.ts`.
- Corrigido: na cena, a 390 px a página rolava na horizontal (textos `sr-only` das abas de lugar escapavam da faixa rolável).

**Como testar manualmente**
1. Abra o caso, guarde algumas fontes e clique em "Caderno".
2. Abra uma carta, marque como importante e escreva uma anotação. Volte: a carta sobe para o começo e mostra "com anotação".
3. "Ver a fonte completa" e "Voltar à ficha". No bilhete, teste a letra de forma.
4. Em Anotações, escreva algo; em Hipóteses, crie, edite e apague uma hipótese.
5. Recarregue a página: tudo continua lá.
6. Navegue só pelo teclado (Tab, setas nas abas, Esc fecha) e teste a 390 px de largura.

**Pendente / observações**
- Hipóteses ainda não se ligam a cartas; isso pode entrar junto da linha do tempo ou da resolução.

## Fase 3 — Linha do tempo ✅ (aguardando revisão)

**Feito**
- **Tela da linha do tempo** (`/casos/[slug]/linha-do-tempo`), aberta pela cena ("Linha do tempo") e pelo caderno. Vertical em todas as larguras, do "Começo" ao "Fim" definidos pelo caso; no desktop, o caderno e a área "Fora da história" ficam numa coluna lateral fixa.
- **Tudo por botão e teclado, sem arrastar** (PRD §5.7.2):
  - pôr uma carta do caderno no fim, no começo ou "depois de" qualquer momento;
  - mover para antes/depois;
  - "Aconteceu junto com a de cima" agrupa simultâneas; "Separar do grupo" desfaz;
  - mandar para **Fora da história**, com justificativa opcional;
  - devolver ao caderno.
- Em cada carta posicionada: **grau de certeza** (certo / provável / incerto), "Por que está aqui?" e as ligações em que ela aparece.
- **Ligações entre cartas** (causou, é consequência de, confirma, contradiz, menciona) com explicação editável. Não aceita a mesma carta nas duas pontas nem ligação repetida. Uma ligação some da tela quando uma das cartas volta ao caderno e reaparece quando ela volta ao jogo.
- Depois de cada ação, o foco segue a carta e um `aria-live` anuncia o resultado ("Ofício da Prefeitura está na posição 2 de 3.").
- Contador "X de N cartas na linha do tempo para liberar a conclusão" (`minCardsToResolve`). Libera pela quantidade, não pela ordem (PRD §5.7.4).
- O aviso "Esta é a sua reconstrução…" deixa claro que a posição é hipótese do jogador.
- O caderno mostra a situação real de cada carta (na linha do tempo / fora da história / ainda não está).
- **Medalha Cronista** passa a valer: linha montada até o mínimo do caso e toda carta posicionada justificada.
- Justificativas e certeza ficam guardadas mesmo quando a carta volta ao caderno.
- Regras puras em `lib/game/timeline.ts`, testadas em `tests/unit/timeline.test.ts`. Nada privado (ordem de referência, marcos) vai para o navegador; `check:leaks` passa.

**Como testar manualmente**
1. Guarde algumas fontes na cena e clique em "Linha do tempo".
2. Ponha cartas usando "no fim", "no começo" e "depois de…". Mova com "Antes"/"Depois", inclusive só pelo teclado: o foco acompanha a carta.
3. Em "Mais ações", junte uma carta com a de cima, separe, mande para "Fora da história" e devolva ao caderno.
4. Marque a certeza, escreva "Por que está aqui?" e crie uma ligação. Tente criar a mesma ligação de novo.
5. Com 4 cartas posicionadas e justificadas, a medalha Cronista acende em /fases.
6. Recarregue: tudo continua. Teste a 390 px.

**Pendente / observações**

## Fase 4 — Conferência, conclusão e encerramento ✅ (aguardando revisão)

**Feito**
- **Contadores no servidor**: conferências usadas, tentativas usadas e o resultado (resolvido / encerrado) ficam num cookie `httpOnly` assinado com HMAC (`lib/game/signed-state.ts`). Recarregar, fechar a aba ou editar o `localStorage` não reabre nada. Em produção, `GAME_SECRET` é obrigatório; em desenvolvimento há um segredo de reserva.
- **Server Actions** (`lib/game/actions.ts`): validam tudo com zod e devolvem só o resultado da regra. A solução só sai em `getClosure`, e só depois do encerramento. `check:leaks` continua passando.
- **Conferência da linha do tempo** (painel na linha do tempo):
  - limitada a `maxTimelineChecks` (3 no caso de demonstração), opcional e com confirmação antes de gastar;
  - olha só os marcos-chave e devolve uma pista pelas regras da D6 (marco faltando → carta estranha entre marcos → par invertido → padrão), com o nível da dica subindo a cada conferência;
  - se os marcos estão coerentes, diz isso sem falar das outras cartas;
  - as pistas anteriores ficam no histórico.
- **Tela da conclusão** (`/casos/[slug]/conclusao`): pergunta, linha do tempo compacta como consulta, quatro escolhas em cartões de rádio, justificativa opcional, contador de escolhas e aviso antes de gastar a última escolha.
  - O servidor confere de novo o mínimo de cartas posicionadas.
- **Avaliação da resposta** (`lib/game/answer.ts`): variantes aceitas e grupos de conceitos, sem acentos, maiúsculas nem pontuação. Termos de 5 letras ou mais casam com o começo da palavra ("agrimensor" → "agrimensora"). Os erros comuns ignoram negações ("não foi roubado" não dispara o erro "roubo"). Depois vêm as respostas parciais previstas e os feedbacks padrão.
- **Encerramento** (`/casos/[slug]/encerramento`): resultado; pergunta e última conclusão; o que aconteceu e a resposta de referência; **linha de referência lado a lado com a do jogador**, com marcas para "em ordem coerente", "a ordem diverge", "bem descartada", "fazia parte da história" e "não posicionada"; como situar as cartas sem data; cartas fora da história e por quê; relações entre as fontes; limites das fontes; referências; medalhas. O tom é de aprendizado, não de correção.
- **Placar e treino**: estrelas, pontos e detalhamento dos itens aparecem no topo do encerramento. “Jogar de novo” preserva o resultado oficial e marca a nova partida como treino. O tom é de aprendizado, não de correção.
- O status local (catálogo, medalha Detetive) acompanha o resultado do servidor, mesmo se o caso foi encerrado em outra aba.
- Testes: avaliação de respostas, conferência, comparação no encerramento e assinatura do estado (`tests/unit/resolution.test.ts`, `tests/unit/signed-state.test.ts`).

**Como testar manualmente**
1. Monte a linha do tempo com o bilhete antes do livro de visitas e clique em "Conferir": vem uma pista sobre "ontem". Recarregue: o contador continua.
2. Com 4 cartas na linha, abra "Escrever a conclusão". Envie "roubo": não gasta tentativa.
3. Envie "Alguém roubou o livro": a resposta é recusada com orientação e as tentativas caem para 4 de 5.
4. Envie "O bibliotecário emprestou o livro para a agrimensora fazer a medição": a conclusão é aceita. Abra o encerramento.
5. Para ver o caminho das 5 tentativas erradas, apague os cookies do site (isso recomeça os contadores).

**Pendente / observações**
- Em produção, defina `GAME_SECRET` (veja `.env.example`).
- Hipóteses ainda não se ligam a cartas nem a trechos da linha (PRD §5.8): fica para uma próxima etapa.
- Sem painel do professor nem métricas (fora do MVP, D1).

## Verificação manual atualizada

1. Inicie o tutorial e examine as cenas apenas com teclado; guarde as fontes.
2. Na linha do tempo, posicione cartas no começo e no fim, abra uma carta por vez, justifique e crie uma ligação na aba correspondente.
3. Resolva os enigmas opcionais, posicione o mínimo de cartas e abra a conclusão.
4. Escolha uma alternativa errada, confira o feedback e escolha a correta; observe o placar e o detalhamento dos pontos.
5. Em Encerramento, escolha “Jogar de novo”, confirme, termine novamente e verifique o rótulo “Treino” e o primeiro resultado preservado em Fases.

## Caso real 1 — "A lei de dois artigos" (abolição) ✅ (aguardando revisão de História)

**Feito**
- Caso `abolicao` com fontes reais, desenhado em `docs/superpowers/specs/2026-10-20-caso-abolicao-design.md` a partir do Caso 3 do documento de casos da versão inicial.
- Pergunta: "Como e por que a escravidão terminou no Brasil?". Duas cenas reconstruídas (redação de jornal e escritório de advogado), avisadas como reconstrução no briefing.
- 7 cartas: Lei nº 581/1850 (fora da história), Lei do Ventre Livre (1871), trecho de *O Abolicionismo* de Joaquim Nabuco sem data (situável entre 1871 e 1885), Lei dos Sexagenários (1885), pedido do Clube Militar (out. 1887, só descrição), Lei Áurea (1888) e missa campal de 17/5/1888 (ilustração da equipe). Marcos-chave: 1871, 1885 e 1888.
- Transcrições conferidas no original: leis no Planalto; Nabuco na edição de 1883 digitalizada pela UNESP (p. 34–35). O verso de cada carta explica em português atual.
- Contexto com abolicionistas negros: Luiz Gama, André Rebouças e José do Patrocínio.
- Arte em `scripts/pixel-art/abolicao.mjs` (peças de cenário comuns em `scenery.mjs`). Testes em `tests/unit/abolicao.test.ts`.

**Como testar manualmente**
1. `pnpm build && GAME_SECRET=qualquer-coisa-longa pnpm start` (sem `GAME_SECRET` a conferência e a conclusão dão erro em produção).
2. Em /fases, abra "A lei de dois artigos". Na redação, a gaveta está trancada; a chave fica no escritório.
3. Guarde as 7 fontes, monte a linha e ponha a lei de 1850 em "Fora da história". Conferir deve dar "ok".
4. Envie "foi por bondade da princesa": recebe orientação. Envie "aos poucos, com as leis de 1871 e 1885, e por pressão dos abolicionistas e das fugas": aceita.

**Pendente / observações**
- Localizar o texto original e o dia exato do pedido do Clube Militar (25 ou 26 de outubro de 1887).
- Revisão do conteúdo pela professora / alguém de História (PRD §7).
- A Gazeta de Notícias de 14/5/1888 ficou de fora (texto não localizado).

## Casos beta 1, 2, 4 e 5 + tutorial ✅ (aguardando revisão de História)

**Feito**
- Tela de fases em ordem: **Tutorial** (`demo-biblioteca`) → Caminha → Inconfidência → Abolição → Vargas → Revolução Industrial. Campos novos no `case.json`: `order`, `tutorial` e `beta` (etiqueta "Beta: conteúdo em revisão").
- Quatro casos em versão de baixa fidelidade, a partir do documento "Casos da Versão Inicial": 1 cena, 6 cartas (5 da história, 1 fora), 1 carta sem data situável, 3 marcos-chave, gaveta trancada com chave na cena.
  - `caminha` — "A carta guardada por 270 anos": trechos da carta de Caminha (Wikisource, ortografia atualizada); Tordesilhas fora da história.
  - `inconfidencia` — "O ouro, o poeta e a forca": Cartas Chilenas (sem data) e sentença (Wikisource); quinto, denúncia e bandeira resumidos; lei da bandeira de MG (1963) fora da história.
  - `vargas` — "O homem que saiu da vida": Código Eleitoral, Constituição de 1937 e CLT (Planalto); carta-testamento (sem data); Constituição de 1891 fora da história. Aviso de mediação no briefing.
  - `revolucao-industrial` — "O vapor e as crianças da fábrica": patente de Watt, depoimento à comissão Sadler (sem data, traduzido), Factory Act, Chadwick; CLT brasileira fora da história.
- Arte em `scripts/pixel-art/casos-iniciais.mjs` (as quatro cenas usam a mesma planta de sala). Testes em `tests/unit/casos-beta.test.ts`.
- Next.js atualizado para 16.4.3 (corrige a falha de segurança das Server Actions).

**Pendente / observações**
- Revisão de conteúdo pela professora / alguém de História. Várias cartas resumem documentos em vez de transcrever (quinto, denúncia, bandeira, Ludd, Factory Act, Chadwick).
- Versões Fundamental/Médio, distintivos por caso e dicas dentro do cenário ficaram para depois.

## Noir 16-bit e veredito por época e ordem ✅ (aguardando revisão)

**Feito** (decisão D21, plano `docs/superpowers/plans/2026-10-28-noir-veredito-epoca-ordem.md`)
- Veredito novo em `/casos/[slug]/conclusao`, igual ao mockup: parte 1, época de A a E (blocos navegáveis por setas) e "Confirmar época"; parte 2, "Ponha os fatos em ordem" (bandeja de pistas e barbante), "Conferir ordem" com carimbo "X de Y no lugar" e envio único (`submitVerdict`). Época 400 + ordem até 600; 1000 = 100%.
- Cena igual ao mockup: HUD com lupas (conferências) e moeda (fontes), título do lugar, sala na moldura preta com a lanterna, painel "Pistas" com espaços de "?" e "Abrir o veredito", fala do detetive embaixo.
- Tela de título igual ao mockup: links no topo, lupas, "Começar investigação" e "aperte Enter" (funciona).
- Resultado com o detetive ao lado e os botões "Ver solução comentada", "Jogar de novo (treino)" e "Voltar ao mapa".
- Encerramento com placar animado (estrelas, total, barras de época e ordem, carimbo) e a época certa ao lado da escolhida.
- Os 6 casos têm `epochOptions` (público) e `epochAnswer` (privado). Saíram `period`, rótulos da linha do tempo, alternativas da conclusão e palpite de época na cena.
- Estado assinado v3 e progresso local v3 (partidas antigas recomeçam, cartas e linha ficam).
- Cena: sala mais escura com a lanterna, brilhos nos objetos não examinados, a sala acende com todas as fontes, fala do detetive datilografada.
- Clima na frente do cenário (chuva, neblina, poças, relâmpago na tela inicial, em Fases e no encerramento), filtro de monitor velho e íris fechando no clique.
- Visual noir em todas as telas: tokens, Jersey 10 e Jacquard 24, céu com estrelas, chuva, neblina e chão (`NightSky`), sprites em SVG (`PixelSprite`), abertura em íris, tela inicial com a rua do arquivo, Fases como quadro de alfinetes com barbante (cards no celular).

**Roteiro de teste manual**
1. Início → Jogar → escolher um alfinete → Abrir o caso → examinar a cena com a lanterna e guardar as fontes.
2. Linha do tempo: pôr as cartas em ordem → Dar o veredito.
3. Veredito: escolher a época (setas também funcionam) → Confirmar época → pegar cada pista e prender numa casa (deixar na bandeja a que não pertence) → Conferir ordem.
4. Encerramento: conferir pontos, estrelas e a época certa; Jogar de novo (treino) mantém o resultado oficial em Fases.
5. Repetir com "Reduzir movimento" ligado em Opções: nada pisca nem se move.

**Pendente**
- Revisão de História das cinco épocas de cada caso.
- Verificação manual com leitor de tela no veredito.

## Critérios de aceitação do PRD (§12)

- [x] Iniciar uma investigação (Fase 1)
- [x] Explorar objetos (Fase 1)
- [x] Coletar evidências (Fases 1 e 2)
- [x] Montar a linha do tempo (Fase 3)
- [x] Justificar posições (Fase 3)
- [x] Relacionar cartas (Fase 3)
- [x] Montar sem arrastar (Fase 3)
- [x] Preservar progresso (Fases 1–4)
- [x] Liberar a resolução (Fase 4)
- [x] Enviar uma solução (Fase 4)
- [x] Limitar tentativas (Fase 4)
- [x] Apresentar feedback (Fase 4)
- [x] Explicar o caso (Fase 4)
- [ ] Usar em dispositivos diferentes
