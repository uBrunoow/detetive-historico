# Jogo colorido, enigmas e pontuação

Data: 2026-10-27 · Base: crítica de design de 2026-10-27 (`.impeccable/critique/2026-10-27T21-57-05Z__app.md`, nota 22/40) e pedidos do dono do projeto.

## Intenção

A professora vai ver o beta. Hoje o jogo tem duas caras: as cenas e o visualizador de documento são pixel art com autoria, e todo o resto (fases, briefing, linha do tempo, conclusão) parece um formulário web marrom. O dono não gostava do layout e não sabia dizer por quê. A crítica nomeou o problema, e o dono escolheu três mudanças:

1. **Visual de jogo 2D colorido.** A referência é o clima dos jogos de plataforma clássicos (céu azul, verdes, cores primárias fortes, contorno marcado, cenários alegres). A arte continua original: nenhum personagem, cenário, logotipo ou elemento reconhecível de jogos existentes.
2. **Enigmas.** O caso vira um mistério do tipo "em que época você está, e o que aconteceu?". Pequenos quebra-cabeças destravam as pistas.
3. **Dá para ganhar e fazer pontos.** A conclusão vira uma escolha entre alternativas, com justificativa opcional. Há pontos por acertar a resposta e pontos extras por acertar a ordem dos acontecimentos. O resultado aparece em 1 a 3 estrelas.

O dono sabe que isso se afasta do PRD ("não é quiz", "resposta escrita pelo aluno", "medalhas premiam o processo, não o acerto"). A decisão é dele. A justificativa escrita continua existindo e vale pontos, então a escrita não some.

## Objetivos

- Um visual único em todas as telas: pixel dominante, colorido e legível, num quadro de jogo consistente.
- Corrigir os 5 problemas da crítica: fonte pixel ilegível em tamanhos pequenos, linha do tempo em formato de formulário, falta de quadro de jogo consistente, bug do contador de fontes, briefing e fases com leitura demais.
- Quatro tipos de enigma, usados nos 6 casos: palpite de época, cadeado com código, peças para montar e pergunta sobre a fonte.
- Conclusão por escolha entre alternativas, com justificativa opcional, pontuação e estrelas.
- Continuar passando em `pnpm verify`, inclusive na verificação de vazamento.

## Fora do escopo

- Banco de dados, contas, ranking entre alunos ou painel do professor.
- Pontos por velocidade ou cronômetro.
- Personagem controlável, pulo, movimento em plataforma. O "jogo de plataforma" é referência visual, não mecânica.
- Dicas dentro do cenário, que ficaram para depois numa conversa anterior.
- Versões Fundamental/Médio separadas.

## O que não pode acontecer (anti-objetivos)

- **Copiar** Sonic, Mario ou qualquer jogo: nem personagens, nem fases, nem sons, nem logotipos, nem paleta idêntica a uma tela famosa.
- **Travar o aluno para sempre** num enigma. Todo enigma tem saída:
  - depois de 2 erros aparece uma dica que aponta onde está a resposta;
  - depois de 3 erros dá para pular, perdendo só os pontos daquele enigma.
- **Revelar a solução no navegador** antes do encerramento: resposta certa da conclusão, código dos cadeados, respostas das perguntas sobre a fonte, época correta, ordem de referência. Tudo continua no `solution.json` e é conferido por Server Actions.
- **Perder acessibilidade.** Tudo precisa funcionar só com teclado e leitor de tela, inclusive o quebra-cabeça de peças. Estado nunca só por cor, contraste AA, alvos de 44 px.
- **Cores que cansam ou ferem a leitura.** O texto corrido continua em fundo claro com tinta escura. A cor vai para molduras, céu, chão, HUD, botões e estrelas.

## Decisões tomadas

### Visual

- **Pixel dominante, colorido.** A paleta nova é saturada e clara:
  - céu azul;
  - grama verde;
  - amarelo-ouro para pontos e estrelas;
  - vermelho e azul primários nos botões;
  - contorno escuro de 2 px.
- A madeira marrom deixa de ser o fundo padrão.
- A "repartição datilografada" fica **só dentro dos documentos**: papel, Courier e carimbos aparecem no visualizador de fonte e nas fichas, e em nenhum outro lugar.
- **Tipografia:**
  - Pixelify Sans só em títulos de 26 px ou mais;
  - botões, abas, contadores, HUD, rótulos e qualquer número ou data em Atkinson Hyperlegible, em negrito onde for UI;
  - Courier e a letra manuscrita só dentro dos documentos.
- **Quadro de jogo único** (`GameScreen`) em todas as telas:
  - HUD superior de uma linha: voltar, nome do caso, pontos/estrelas do caso, Caderno, Linha do tempo;
  - palco centralizado com largura máxima;
  - fundo de cenário colorido (céu e chão em pixel) igual em todas as telas de jogo.
- Opções, Créditos e Como jogar usam o mesmo quadro, centralizado.
- A cena precisa caber em 1366×768 sem rolar.
- **A arte dos 6 casos é gerada de novo** com a paleta nova, pelos mesmos scripts (`scripts/pixel-art/`). A planta das cenas e os hotspots não mudam, para não mexer nos `case.json`.

### Telas

- **Fases:**
  - cards mais baixos, 3 colunas no desktop;
  - metadados numa linha ("1500 · Bahia · Fácil · 20 min");
  - estrelas do caso (0 a 3) no lugar das 3 medalhas cinza;
  - selo "Beta" uma vez só, no cabeçalho da tela;
  - o Tutorial com destaque próprio, maior ou primeiro com cor diferente.
- **Briefing:**
  - botão "Começar" visível sem rolar;
  - narrativa curta em Atkinson;
  - sem a seção "Como investigar", que repete o Como jogar;
  - o carimbo "Caso aberto" não cobre texto.
- **Linha do tempo** vira um tabuleiro:
  - cada carta posicionada é compacta (miniatura, título, data, ↑ e ↓), e com 6 cartas tudo cabe numa tela de 768 px;
  - certeza e "Por que está aqui?" aparecem ao abrir a carta;
  - pôr uma carta do caderno usa botões diretos ("no fim", "no começo"), sem `<select>`; "depois de…" só aparece ao abrir a carta;
  - ligações entre cartas vão para uma aba ou passo separado, que só aparece com 2 ou mais cartas na linha;
  - "Começo" e "Fim" viram marcos neutros, sem a faixa vermelha de alerta.
- **Conclusão:** a nova tela de escolha (ver abaixo).
- **Encerramento:** passa a abrir com o placar (estrelas, pontos, detalhamento). O resto do encerramento atual continua: linha de referência comparada, explicação, fontes.
- **Bug do contador:** o caderno não pode dizer "você encontrou todas as fontes" enquanto houver fonte não guardada. Os três contadores da cena viram um só ("Fontes: 6 de 7").
- **Observações menores da crítica:**
  - modal "Observação" com moldura pixel;
  - etiquetas do modo "mostrar áreas" sem sobreposição;
  - carimbo ARQUIVADO sem cobrir o cabeçalho;
  - foco inicial do visualizador no título, não no botão "Guardar";
  - estado vazio da linha do tempo com botão "Ir para a cena";
  - "a definir" fora dos Créditos.

### Enigmas

Os quatro tipos são dados do caso. Um caso novo entra sem mudar componentes. A parte pública diz **que existe** o enigma e mostra as opções; a resposta fica no `solution.json`.

1. **Palpite de época.**
   - Depois que o aluno guarda as 2 primeiras fontes, aparece uma vez a pergunta "Em que época você está?", com 4 opções (ex.: "Por volta de 1500", "Por volta de 1790", "Por volta de 1880", "Por volta de 1940").
   - Acertar na primeira tentativa dá bônus. Errar mostra uma pista ("Olhe as datas das fontes que você já guardou") e deixa tentar de novo, sem bônus.
   - Não trava nada.
   - Nos casos fictícios (tutorial), o palpite é sobre o ano dentro da história.
2. **Cadeado com código.**
   - Em cada caso, o objeto trancado passa a abrir com um código: o aluno digita um número (um ano, um dia) que aparece escrito em outra fonte da cena.
   - Isso substitui a chave pendurada na parede nos casos em que o dono quiser. Nos 6 casos atuais, substitui sim.
   - A pergunta do cadeado é pública ("O cadeado pede o ano em que a frota partiu"); o código fica no `solution.json`.
   - Depois de 2 erros, a dica diz em qual fonte procurar. Depois de 3, aparece "Abrir mesmo assim" (sem os pontos do enigma).
3. **Peças para montar.**
   - Uma fonte por caso aparece rasgada em 6 peças (grade 3×2) e precisa ser montada antes de ler.
   - Funciona com mouse ou toque (clicar numa peça e depois em outra troca as duas) e com teclado (setas movem a seleção, Enter troca), com anúncio por leitor de tela ("Peça 3 no lugar certo. Faltam 2.").
   - O arranjo embaralhado é gerado no cliente. Não é segredo, porque a imagem montada é a própria miniatura da fonte.
   - Dá para pular depois de 1 minuto, sem os pontos.
4. **Pergunta sobre a fonte.**
   - Ao guardar algumas fontes (as que o caso marcar, de 2 a 4 por caso), aparece uma pergunta rápida com 3 opções (quem escreveu, de quando é, o que pede).
   - Acertar dá pontos. Errar mostra uma explicação curta.
   - A carta é guardada de qualquer jeito: a pergunta nunca impede guardar.

### Conclusão e pontuação

- A conclusão mostra a pergunta do caso e **4 alternativas** escritas pela equipe: uma certa e três erradas plausíveis, ligadas aos erros comuns que já existem no caso.
- O aluno escolhe uma. Embaixo há um campo opcional: "Justifique em uma frase (vale pontos extras)".
- **Tentativas:** 2 escolhas por caso.
  - Errar a primeira mostra o feedback orientador daquela alternativa e deixa tentar de novo.
  - Errar as duas encerra o caso como "não resolvido", e o encerramento mostra tudo como hoje.
  - Isso substitui as 5 tentativas de texto livre.
- A justificativa é avaliada pela regra de conceitos que já existe (`evaluateAnswer`, `conceptGroups`, `minGroupsToAccept`). Se for "aceita", dá bônus; se for "parcial", dá meio bônus.
- **Pontos**, calculados e guardados no servidor (cookie assinado, como os contadores atuais):

  | Item | Pontos |
  |---|---|
  | Resposta certa na 1ª escolha | 500 |
  | Resposta certa na 2ª escolha | 250 |
  | Ordem dos acontecimentos | até 300, proporcional às cartas em "ordem coerente" na comparação que o encerramento já faz (`lib/game/closure.ts`); carta fora da história bem descartada conta como acerto |
  | Justificativa aceita / parcial | 150 / 75 |
  | Palpite de época certo na 1ª | 100 |
  | Cada cadeado aberto sem pular | 50 |
  | Peças montadas sem pular | 50 |
  | Cada pergunta sobre a fonte acertada | 25 |
  | Cada conferência da linha do tempo usada | −25 |

  Mínimo 0.
- **Estrelas:**
  - 1 estrela: resolveu o caso;
  - 2 estrelas: resolveu e a ordem passou de 70% coerente;
  - 3 estrelas: resolveu na 1ª escolha, ordem 100% coerente e justificativa aceita.
- As estrelas e os pontos do caso aparecem no HUD, nas Fases (cópia no `localStorage`, como o status já faz hoje) e no encerramento.
- **Medalhas:** as três medalhas atuais (Arquivista, Cronista, Detetive) continuam no encerramento como reconhecimento do processo. Nas Fases, só as estrelas.

### Jogar de novo (decisão do dono)

- O encerramento ganha o botão "Jogar de novo". Ele zera o cookie assinado e o progresso local daquele caso, para o aluno treinar.
- **O resultado oficial é sempre o da primeira vez.** As estrelas e os pontos das Fases e do HUD ficam os da primeira conclusão, porque quem rejoga já viu as respostas. O primeiro resultado fica gravado à parte (no cookie assinado e no `localStorage`) e o reinício não apaga.
- Na nova partida, o placar aparece como "treino", sem trocar o resultado oficial.

### Detalhes resolvidos por quem escreveu este documento (conferir)

- **Base da "ordem coerente"** (os 300 pontos e os limites de 70% e 100% das estrelas):
  - o total é **todas as cartas da referência** (as da história e as de fora);
  - conta como acerto a carta da história "em ordem coerente" e a carta de fora "bem descartada";
  - não posicionada, mal descartada ou fora de ordem não conta.
  - Assim as estrelas também premiam explorar a cena. Os casos têm de 6 a 7 cartas, então o 100% é alcançável.
- **Caso não resolvido** (errou as 2 escolhas): 0 estrelas. O placar ainda mostra os pontos de ordem e de enigmas, como aprendizado.
- **Justificativa:**
  - só vale quando a alternativa escolhida é a certa;
  - se o aluno acertar na 2ª escolha, vale a melhor das justificativas escritas;
  - com menos de 3 palavras, é ignorada, sem erro.
  - Para a 3ª estrela basta justificativa **aceita ou parcial** (ao menos um conceito do caso), porque uma frase curta raramente cobre dois conceitos. Os `conceptGroups` atuais ficam como estão.
- **Chave pendurada:** nos 6 casos o cadeado com código substitui a chave. O objeto de contexto da chave sai do `case.json` e da arte. Em seu lugar, o objeto trancado mostra a pergunta do cadeado. A exceção "a planta das cenas não muda" vale para todo o resto; só esse objeto sai.
- **Quem escreve o conteúdo dos enigmas e das alternativas:** a equipe de desenvolvimento escreve agora, com as fontes já conferidas de cada caso, para o beta. A professora revisa depois. Por isso os campos de enigma são **opcionais** no schema (um caso pode não ter cadeado, peças ou perguntas), mas as **alternativas da conclusão são obrigatórias** em todo caso publicado.

### Conteúdo

Para os 6 casos (o tutorial e os 5 reais), a equipe escreve:
- as 4 opções de época e qual é a certa;
- o código e a pergunta do cadeado;
- qual fonte vira peças;
- 2 a 4 perguntas sobre fontes;
- as 4 alternativas da conclusão, com feedback para cada errada.

Tudo isso segue a mesma regra das fontes: nada inventado apresentado como autêntico. Os textos da equipe seguem a voz do `PRODUCT.md` (11 anos, acolhedora, "revise", nunca "você falhou").

### Documentos do projeto

- `DECISOES.md` ganha uma decisão nova registrando a troca de texto livre por escolha com justificativa, e a pontuação.
- `PRODUCT.md` é atualizado: o diferencial deixa de ser "não é quiz" e passa a ser "interpretar fontes e ordenar acontecimentos; a escolha final é apoiada na linha do tempo".
- `PROGRESSO.md` registra a entrega.
- Um `DESIGN.md` novo descreve a paleta, a tipografia e o quadro de jogo.

## Deixado para quem constrói

- Os valores exatos das cores. Restrições: claras e saturadas, contraste AA em todo texto, e os tokens existentes em `app/globals.css` atualizados no lugar, sem criar um segundo sistema.
- O desenho exato do fundo de cenário (céu e chão) e se ele muda por caso.
- Animações. Se existirem, respeitam "reduzir movimento".
- Como a linha do tempo compacta abre a carta (expandir no lugar ou painel lateral), desde que todas as cartas caibam numa tela.
- A estrutura dos novos campos no `case.json` e no `solution.json`. Restrição: schemas `strict` e nada que revele resposta no arquivo público.
- A ordem de implementação.
