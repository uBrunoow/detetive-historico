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

