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

## D9 — Documentos desenhados a partir da transcrição (Fase 1)

Cada evidência tem um campo `presentation` (`typed`, `handwritten`, `printed`, `ledger`, `drawing`; papel `office`, `lined`, `aged`, `newsprint`, `receipt`; timbre; carimbo). O visualizador desenha a fonte como papel (textura, dobra, carimbo com falhas de tinta) **usando a própria transcrição como texto**. Ganhamos realismo sem perder acessibilidade: o texto continua selecionável, ampliável e lido por leitor de tela. Desenhos e mapas usam a imagem. É dado do caso, então um caso novo escolhe o visual de cada fonte sem mexer em código.

## D10 — Manuscritos com opção "letra de forma"

Fontes manuscritas usam uma letra cursiva legível (Kalam), mas um botão troca para a letra de leitura (Atkinson). A cursiva é parte da experiência de ler uma fonte de época, mas não pode ser barreira para quem tem dificuldade de leitura.

## D11 — Condições de desbloqueio avaliadas no navegador

Sem banco, a regra "a gaveta só abre depois de examinar o chaveiro" roda no cliente (`lib/game/scene.ts`). A condição é conteúdo público, não revela a solução, e burlar isso só antecipa o acesso a uma fonte que o jogador acharia de qualquer forma.

## D12 — Lista acessível dos objetos da cena

Além do botão "Mostrar o que dá para examinar", a cena tem uma lista recolhida ("Lista do que dá para examinar") com os mesmos objetos e seus estados (examinado, trancado, no caderno). Atende teclado e leitor de tela sem transformar a cena numa fileira de botões (PRD §5.4). Inspirado no estudo do Carmen Sandiego (`docs/referencias/`).

## D13 — Caderno como diálogo sobre a cena

O caderno abre num diálogo modal por cima da cena, e não numa página própria. O PRD pede que ele esteja disponível "sem exigir que o jogador saia definitivamente da cena"; o diálogo mantém o lugar, a luz e a posição de rolagem, e o navegador cuida do foco preso e do Esc. Dentro dele, ficha e fonte completa trocam de vista em vez de abrir um segundo diálogo, e o foco vai para o título da nova vista.

## D14 — Hipóteses simples no MVP

Hipóteses são textos livres no caderno (criar, editar, apagar), sem ligação com cartas por enquanto. Sempre aparecem com a etiqueta "hipótese, não confirmada", para que o jogo nunca apresente uma interpretação do jogador como fato (PRD §5.6).

## D15 — Linha do tempo vertical, por botões, em página própria

A linha do tempo é o principal instrumento de dedução e precisa de espaço para certeza, justificativa e ligações, por isso tem página própria (o caderno continua abrindo por cima dela). É vertical em todas as larguras: no celular é o que o PRD pede, e no desktop a leitura de cima para baixo comporta textos longos sem rolagem lateral. Não há arrastar: pôr, mover, juntar, separar e tirar são botões, o que atende teclado, leitor de tela e toque com o mesmo código.

## D16 — Modelo da linha do tempo

A ordem é uma lista de *momentos*, e cada momento guarda uma ou mais cartas simultâneas. Isso representa "acontecem ao mesmo tempo" sem números de posição soltos. Mover uma carta que está num grupo a tira do grupo e a põe ao lado dele. Certeza e justificativa ficam guardadas por carta e sobrevivem à volta ao caderno. As ligações também ficam guardadas, mas só aparecem quando as duas cartas estão em jogo (na linha ou fora da história).

## D17 — Contadores num cookie assinado

Os contadores de conferências e tentativas e o resultado do caso ficam num cookie `httpOnly` por caso, assinado com HMAC-SHA256 (`GAME_SECRET`). Escolhemos o cookie porque o servidor o lê e grava sozinho, sem o cliente carregar um token. A página não consegue ler nem alterar o cookie, e editar o `localStorage` não reabre tentativas nem libera o encerramento. Limites conhecidos, coerentes com a D1: apagar os dados do site recomeça os contadores, e quem guardar uma cópia antiga do cookie pode restaurá-la. Só contas reais resolveriam isso. O histórico mostrado ao jogador (pistas, tentativas) fica no `localStorage`, mas é só exibição.

## D18 — Regras de comparação das respostas

- Antes de comparar, o texto perde acentos, maiúsculas e pontuação.
- Expressões de várias palavras precisam aparecer inteiras.
- Um termo de uma palavra com 5 letras ou mais também casa com o começo de uma palavra ("agrimensor" → "agrimensora"), para tolerar gênero e plural sem obrigar o editor a listar todas as formas.
- Um gatilho de erro comum precedido de "não", "nem", "sem", "nunca" ou "jamais" (até 3 palavras antes) não conta.
- A ordem é: variante aceita → grupos suficientes (aceita) → erro comum → resposta parcial prevista → feedback padrão.
- Respostas com menos de 3 palavras não gastam tentativa.

## D19 — Conferência confirma quando os marcos estão coerentes

Se nenhum marco falta, nenhuma carta de fora da história está entre eles e a ordem relativa dos marcos bate, a conferência diz isso, avisando que não fala das outras cartas. Ficar em silêncio nesse caso faria a conferência parecer quebrada. Marcos postos no mesmo momento (simultâneos) contam como fora de ordem, porque a referência os separa.

## D20 — Escolha com justificativa e pontuação (27/10/2026)

A conclusão passou a usar quatro alternativas, em vez de exigir uma resposta livre para cada tentativa. Isso reduz a barreira de escrita para estudantes de 11 anos, mantém a decisão histórica baseada nas fontes e permite feedback específico para cada alternativa. A justificativa livre continua opcional e só pontua quando a escolha está certa (a melhor avaliação vale).

Pontuação: escolha certa na primeira tentativa vale 500 pontos (250 na segunda); a ordem vale até 300; justificativa aceita/parcial vale 150/75; época correta na primeira, cadeados abertos sem pular, peças montadas e perguntas certas valem 100, 50, 50 e 25 por item; cada conferência usada desconta 25. O total nunca fica abaixo de zero.

Estrelas: uma estrela significa caso resolvido; duas exigem ordem acima de 70%; três exigem primeira escolha, ordem perfeita e justificativa aceita ou parcial. “Jogar de novo” inicia uma partida de treino, mas Fases e HUD preservam estrelas e pontos da primeira conclusão.

## D21 — Veredito por época e ordem, e visual noir (28/10/2026)

Substitui a D20. O dono do projeto pediu que o centro do jogo fosse descobrir **em que época** a história aconteceu e **em que ordem** os fatos se deram, com 100% só para quem acerta as duas coisas. A conclusão por quatro alternativas e a justificativa saíram.

- O veredito tem duas partes, como no mockup aprovado, e é dado uma vez por partida. Parte 1: a época, entre cinco alternativas (A a E, em ordem cronológica). Parte 2: a ordem, pegando cada pista na bandeja e prendendo no barbante (uma casa por fonte do caso). As pistas que ficam na bandeja contam como "fora da história". "Conferir ordem" fecha o caso: um carimbo mostra quantas cartas estão no lugar (nunca quais) e a tela segue para o resultado.
- A linha do tempo completa (certeza, justificativas, ligações e conferências com pista) continua disponível e usa a mesma ordem. Cada conferência ali também mostra quantas cartas estão no lugar, sem dizer quais.
- Pontos: época certa vale 400; a ordem vale até 600 (`round(600 × ordem)`, com a mesma medida de antes: cartas "em ordem" mais cartas "bem descartadas", dividido pelo total da referência). Total 1000 = 100%.
- Estrelas: três com 1000; duas com 600 ou mais; uma com qualquer ponto. O caso conta como resolvido a partir de 600. Abaixo disso, a fala é "o caso continua em aberto", nunca "você falhou".
- Enigmas (cadeados, peças, perguntas sobre a fonte) continuam opcionais e não valem pontos. A conferência da linha do tempo continua dando só pistas e não desconta pontos.
- A época certa fica no arquivo privado (`epochAnswer`). Saíram do arquivo público os campos que a entregavam: `period` e os rótulos de começo e fim da linha do tempo. O último parágrafo dos briefings deixou de citar o intervalo de datas.
- O estado assinado passou para a versão 3 e o progresso local também. Partidas e resultados das versões anteriores recomeçam (as cartas e a linha do tempo guardadas no navegador ficam), porque foram pontuados pela regra antiga.
- Visual: noir 16-bit, aprovado no mockup `public/mockup/index.html`. Detalhes em `DESIGN.md`.
