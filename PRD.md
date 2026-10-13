# PRD — Detetive Histórico

Documento de Requisitos do Produto · Versão 1.1 · Outubro de 2026

> **O que mudou na versão 1.1:** inclusão do **sistema de cartas e linha do tempo** como mecânica central de dedução. As evidências coletadas viram cartas, o jogador as organiza cronologicamente e, a partir dessa reconstrução, apresenta a resposta final. A seção 5.7 foi reescrita, e as seções 1, 4, 5.1, 5.6, 5.9, 7, 8, 10, 11, 12, 13, 15 e 16 foram ajustadas para refletir a nova mecânica.

---

## 1. Visão geral do produto

O Detetive Histórico é um jogo digital educativo de investigação no qual o jogador assume o papel de um detetive e precisa solucionar mistérios relacionados à História por meio da exploração de cenários, análise de fontes históricas, coleta de evidências e reconstrução cronológica dos acontecimentos.

Diferentemente de um quiz tradicional, o jogo não se baseia em selecionar alternativas corretas. O jogador precisa explorar o ambiente, examinar objetos, descobrir documentos, transformá-los em cartas de evidência, organizá-las em uma linha do tempo e, a partir dessa reconstrução, formular uma conclusão fundamentada.

A experiência combina narrativa investigativa, exploração visual e aprendizagem histórica, incentivando o pensamento crítico, a noção de cronologia e causalidade e a interpretação de evidências.

| Etapa | O que o jogador faz |
| --- | --- |
| **Explorar** | Investiga ambientes e interage com objetos que podem revelar informações relevantes. |
| **Investigar** | Coleta pistas, consulta fontes e as guarda como cartas no caderno de investigação. |
| **Reconstruir** | Organiza as cartas em uma linha do tempo, situando cada evidência no momento em que aconteceu e indicando relações de causa e consequência. |
| **Solucionar** | Registra uma resposta em texto livre, apoiada na linha do tempo, com até cinco tentativas por caso. |

**Objetivo principal:** transformar o estudo da História em uma experiência ativa de investigação, na qual o conhecimento é construído pela análise de fontes, pela reconstrução da sequência dos fatos e pela interpretação de evidências, e não apenas pela memorização.

Este PRD é uma proposta funcional para orientar design, conteúdo e desenvolvimento. As decisões aqui descritas devem ser validadas com os responsáveis pelo projeto (ver seção 16).

## 2. Problema e oportunidade

O ensino de História pode se tornar excessivamente expositivo quando o estudante tem poucas oportunidades de investigar fontes, levantar hipóteses e justificar interpretações. Além disso, muitos estudantes têm dificuldade em situar acontecimentos no tempo e em perceber relações de causa e consequência.

O Detetive Histórico propõe uma abordagem em que o estudante atua como investigador: observa vestígios, compara informações, identifica contradições, reconstrói a ordem dos acontecimentos e formula explicações para um problema histórico.

O desafio de produto é criar uma experiência que seja simultaneamente:

- **Lúdica:** despertar curiosidade e vontade de continuar investigando.
- **Educativa:** desenvolver interpretação de fontes, noção de cronologia e raciocínio histórico.
- **Coerente:** apresentar pistas que façam sentido dentro do contexto histórico.
- **Acessível:** funcionar em computadores e dispositivos móveis, inclusive em ambientes escolares.
- **Mensurável:** permitir avaliar o progresso da investigação e a aprendizagem sem reduzir o desempenho apenas à quantidade de respostas corretas.

## 3. Público-alvo

| Público | Necessidade principal |
| --- | --- |
| Estudantes | Aprender História de forma interativa e envolvente. |
| Professores | Usar casos investigativos como recurso didático e acompanhar o progresso da turma. |
| Escolas | Disponibilizar uma ferramenta educativa acessível e organizada. |
| Administradores de conteúdo | Criar, revisar e publicar casos históricos sem precisar alterar o código do jogo. |

A faixa escolar inicial deverá ser definida com a instituição responsável pelo projeto. Como hipótese de planejamento, recomenda-se priorizar estudantes dos anos finais do Ensino Fundamental e do Ensino Médio, ajustando linguagem, complexidade das fontes, quantidade de cartas e duração dos casos para cada faixa.

## 4. Objetivos e indicadores de sucesso

### Objetivos do produto

1. Permitir que o jogador resolva um caso por meio da exploração de ambientes históricos.
2. Incentivar a coleta e a interpretação de fontes primárias e secundárias.
3. Desenvolver a capacidade de situar evidências no tempo e reconstruir a sequência de acontecimentos.
4. Estimular a conexão entre diferentes evidências, incluindo relações de causa e consequência.
5. Promover conclusões justificadas por informações encontradas durante a partida.
6. Oferecer ao professor uma atividade que possa ser incorporada às aulas de História.

### Indicadores propostos

| Indicador | O que mede |
| --- | --- |
| Taxa de conclusão de casos | Percentual de jogadores que concluem um caso iniciado. |
| Exploração das cenas | Quantidade e proporção de elementos relevantes investigados. |
| Uso do caderno | Frequência de consulta às cartas e documentos coletados. |
| Qualidade da linha do tempo | Proporção de marcos-chave posicionados corretamente na primeira montagem e após revisões. |
| Revisões da linha do tempo | Quantas vezes o jogador reorganiza as cartas; indica engajamento com o raciocínio cronológico (interpretar junto com a qualidade final, não isoladamente). |
| Uso de cartas irrelevantes | Frequência com que cartas que não pertencem à história são incluídas ou corretamente descartadas. |
| Qualidade das deduções | Capacidade de relacionar evidências à conclusão, conforme rubrica pedagógica. |
| Tentativas até a solução | Eficiência da investigação, interpretada junto com a dificuldade do caso. |
| Aprendizagem | Evolução em atividades de análise histórica e de cronologia antes e depois da experiência. |
| Engajamento | Retorno dos jogadores e continuidade entre casos. |

As metas numéricas deverão ser estabelecidas após testes com estudantes e professores. Terminar rapidamente, acertar na primeira tentativa ou montar a linha do tempo correta por tentativa e erro não comprovam, isoladamente, aprendizagem.

## 5. Escopo funcional do jogo

O núcleo do produto é a experiência de investigação. A interface deve apoiar essa experiência sem substituir o raciocínio do jogador.

### 5.1. Fluxo principal da experiência

1. **Seleção do caso** — O jogador conhece o contexto histórico e o mistério a resolver.
2. **Exploração do cenário** — Clica em objetos, documentos, mapas e outros elementos interativos.
3. **Coleta de evidências** — Examina os itens encontrados; cada evidência coletada vira uma carta no caderno.
4. **Montagem da linha do tempo** — Posiciona as cartas em ordem cronológica, indica o grau de certeza de cada posição e registra relações entre cartas.
5. **Apresentação da solução** — Com a linha do tempo montada, escreve a conclusão e indica as cartas que a sustentam.
6. **Resultado e contextualização histórica** — Recebe feedback, vê a linha do tempo de referência comentada e consulta as fontes.

O jogador poderá alternar livremente entre explorar a cena, consultar o caderno e mexer na linha do tempo. Não é necessário concluir toda a exploração antes de começar a posicionar cartas; a linha do tempo pode ser montada aos poucos, à medida que novas evidências aparecem.

### 5.2. Tela inicial e seleção de casos

A tela inicial deve apresentar os casos disponíveis e permitir que o jogador identifique o tema, o período histórico e o nível de dificuldade.

Cada caso deverá apresentar:

- Título e imagem de capa.
- Breve introdução narrativa.
- Período e contexto histórico.
- Objetivo da investigação, sem revelar a solução.
- Dificuldade estimada e duração aproximada.
- Estado do caso: não iniciado, em andamento ou concluído.

**Requisito:** o jogador deve conseguir iniciar um caso sem passar por questionários de conhecimentos prévios.

### 5.3. Introdução narrativa

Antes de entrar na cena, o jogador recebe um briefing com o mistério que precisa solucionar.

A introdução deverá contextualizar a época, apresentar o problema e indicar o que precisa ser descoberto, sem fornecer diretamente as respostas. Quando relevante, o briefing pode indicar o intervalo de tempo em que a investigação se passa (por exemplo, "entre a chegada da carta e o desaparecimento do documento"), servindo de moldura para a linha do tempo.

Exemplo ilustrativo:

> Um documento importante desapareceu de um escritório histórico. Há registros incompletos, anotações e objetos que podem ajudar a reconstruir o que aconteceu e em que ordem. Investigue o ambiente, organize as evidências no tempo e apresente uma conclusão sustentada pelas fontes.

A narrativa definitiva deverá ser criada para cada caso, respeitando a precisão histórica e a adequação à faixa etária.

### 5.4. Exploração das cenas

A cena é o principal espaço de interação do jogo. Ela poderá representar um escritório, uma residência, um arquivo, uma embarcação, um sítio arqueológico ou outro ambiente coerente com o período investigado.

O jogador deve conseguir:

- Visualizar o cenário completo.
- Identificar objetos interativos por meio do cursor, toque ou indicadores discretos.
- Clicar ou tocar em objetos para examiná-los.
- Abrir documentos em uma visualização ampliada.
- Ler descrições, inscrições, cartas, mapas ou registros.
- Coletar itens relevantes, que viram cartas de evidência.
- Voltar à cena sem perder o progresso.
- Navegar para outras áreas quando o caso possuir mais de um ambiente.

#### Regras dos objetos interativos

| Tipo de objeto | Comportamento esperado |
| --- | --- |
| Evidência coletável | Abre uma visualização e permite adicionar a evidência ao caderno como carta. |
| Fonte para leitura | Exibe um documento ou conteúdo ampliado com contexto e transcrição, quando necessário. |
| Objeto contextual | Fornece informações históricas úteis (inclusive referências de época que ajudam a datar outras cartas), sem necessariamente gerar uma carta. |
| Objeto bloqueado | Informa que uma condição de investigação ainda precisa ser cumprida, se isso fizer parte do caso. |
| Elemento decorativo | Contribui para a ambientação sem produzir uma ação obrigatória. |

Nem todo objeto deve revelar uma pista. A cena precisa parecer um ambiente explorável, e não uma sequência de botões disfarçados.

**Requisito importante:** as áreas clicáveis devem ser definidas independentemente da imagem de fundo, para permitir a criação de cenas com diferentes ilustrações sem reprogramar toda a lógica.

### 5.5. Visualização de evidências

Ao selecionar um item relevante, o jogador deverá visualizar:

- Nome da evidência.
- Imagem, digitalização ou representação visual.
- Descrição do que está sendo observado.
- Transcrição do conteúdo legível, quando aplicável.
- Data, autoria ou procedência, **quando conhecidas** (muitas evidências não terão data explícita; ver 5.7).
- Tipo de fonte histórica.
- Botão para adicionar ao caderno como carta.
- Opção de retornar à cena.

O jogo deve distinguir o que a fonte efetivamente mostra da interpretação que o jogador pode construir a partir dela. Por exemplo, uma carta pode conter uma declaração de determinada pessoa; a existência da declaração não comprova automaticamente que tudo o que foi escrito é verdadeiro. Da mesma forma, a data em que um documento foi escrito pode ser diferente da data dos fatos que ele relata. Essa distinção é parte da aprendizagem.

### 5.6. Caderno de investigação

O caderno funciona como inventário de cartas e espaço de organização intelectual do jogador. Deve estar disponível durante toda a investigação, sem exigir que o jogador saia definitivamente da cena.

Funcionalidades obrigatórias:

- Listar as cartas de evidência coletadas.
- Abrir novamente cada carta e sua fonte completa.
- Exibir o contexto e a transcrição da fonte.
- Permitir anotações pessoais em cada carta.
- Marcar uma carta como importante.
- Indicar quais cartas já estão na linha do tempo e quais ainda não foram posicionadas.
- Exibir quantos itens relevantes ainda não foram descobertos, sem revelar quais.
- Dar acesso direto à linha do tempo.
- Recuperar as anotações, cartas, linha do tempo e progresso quando o jogador retornar ao caso.

O caderno deve separar claramente três categorias:

1. **Evidências (cartas):** materiais efetivamente encontrados.
2. **Anotações:** observações escritas pelo jogador.
3. **Hipóteses:** interpretações ou possíveis explicações elaboradas pelo jogador.

O sistema não deverá apresentar uma hipótese do jogador, nem a posição que ele atribuiu a uma carta, como fato histórico confirmado.

### 5.7. Sistema de cartas e linha do tempo

> Esta seção substitui o antigo "Sistema de conexão de pistas". As relações entre evidências passam a ser registradas dentro da linha do tempo.

A linha do tempo é o principal instrumento de dedução do jogo. Nela, o jogador reconstrói a sequência dos acontecimentos usando as cartas que coletou e, a partir dessa reconstrução, chega à resposta final.

#### 5.7.1. A carta de evidência

Toda evidência coletada gera uma carta.

| Face | Conteúdo |
| --- | --- |
| **Frente** | Imagem ou miniatura da evidência, título curto e tipo de fonte (carta, mapa, objeto, registro oficial, etc.). |
| **Verso** | Descrição, procedência, autoria, data (se conhecida), anotações do jogador e atalho para a fonte completa. |

As cartas se dividem em dois tipos, que **não** são sinalizados ao jogador:

- **Cartas datadas:** trazem data explícita (um carimbo, um registro com dia e mês). Funcionam como âncoras na linha do tempo.
- **Cartas sem data:** precisam ser situadas por indícios internos — uma referência a um acontecimento, um selo, uma moeda, uma pessoa citada como já falecida, o estado de conservação de um objeto. Situar essas cartas é o coração da investigação.

Cada caso pode incluir **cartas que não pertencem à sequência relevante** (documentos de outra época, informações enganosas, fontes pouco confiáveis). O jogador precisa decidir não apenas onde, mas **se** cada carta entra na linha do tempo.

#### 5.7.2. Montagem da linha do tempo

A linha do tempo é uma faixa com início e fim definidos pelo caso. O jogador deve conseguir:

- Posicionar uma carta na linha do tempo.
- Mover a carta para antes ou depois de outra.
- Retirar uma carta da linha do tempo e devolvê-la ao caderno.
- Colocar uma carta na área **"Fora da história"**, indicando que a considera irrelevante ou enganosa, com justificativa opcional.
- Indicar o **grau de certeza** da posição: *certo* (há data ou evidência direta), *provável* (há indícios) ou *incerto* (hipótese).
- Agrupar cartas que acontecem **ao mesmo tempo** ou em momento indistinguível.
- Escrever, em cada carta posicionada, **por que** ela está naquele lugar.
- Criar uma **ligação** entre duas cartas, escolhendo o tipo — *causou*, *é consequência de*, *confirma*, *contradiz*, *menciona* — e explicando a relação em texto.

As ligações substituem o antigo sistema de conexão de pistas: em vez de relações soltas, elas ficam ancoradas na ordem dos acontecimentos, o que torna visível a cadeia de causa e consequência.

A linha do tempo é salva automaticamente a cada alteração e pode ser montada em várias sessões.

#### 5.7.3. Conferência da linha do tempo

Para evitar que o jogador reorganize as cartas por tentativa e erro até acertar, a conferência segue estas regras:

- **Validação por marcos-chave.** Cada caso define de dois a quatro marcos-chave: cartas cuja ordem relativa é essencial para entender a solução. A conferência avalia apenas esses marcos, não a posição de todas as cartas.
- **Feedback orientador, não posicional.** O sistema não informa qual carta está errada nem onde deveria estar. Ele dá pistas graduais, configuradas pelo caso, como "Revise o que aconteceu antes da chegada da carta lacrada" ou "Uma das cartas na linha do tempo foi escrita muito depois dos fatos que descreve".
- **Conferências limitadas.** O jogador tem um número limitado de conferências por caso (proposta: 3), separado das cinco tentativas de resposta final. O número é configurável por caso.
- **Conferência opcional.** O jogador pode seguir para a resposta final sem conferir a linha do tempo.
- **Persistência.** O contador de conferências segue as mesmas regras de persistência das tentativas de resposta (ver 5.9).

O sistema não deverá revelar automaticamente a ordem correta antes do encerramento do caso.

#### 5.7.4. Relação com a resposta final

- A linha do tempo **apoia** a resposta, mas **não é** a resposta. A conclusão continua sendo um texto livre (ver 5.9), para que o jogo não se transforme em um quebra-cabeça de ordenação.
- A tela de resolução só é liberada quando a linha do tempo tiver um **número mínimo de cartas posicionadas**, configurado por caso. Esse requisito garante que o jogador tenha passado pela etapa de reconstrução, mas **não** exige que a ordem esteja correta.
- Na tela de resolução, a linha do tempo fica visível como painel de consulta, e o jogador seleciona nela as cartas que sustentam sua conclusão.

#### 5.7.5. Exemplo ilustrativo

No caso do documento desaparecido, o jogador encontra seis cartas: um recibo datado, um bilhete sem data que menciona "a visita de ontem", um registro de visitas do escritório, uma carta lacrada, um jornal de outro ano (que não pertence à história) e um mapa com anotações. Ao perceber que o bilhete só faz sentido depois da visita registrada, e que o recibo é anterior à carta lacrada, ele reconstrói a sequência, descarta o jornal e chega a uma explicação sobre quem teve acesso ao documento e quando. A resposta final é escrita por ele, apoiada nessa reconstrução.

### 5.8. Sistema de hipóteses

O jogador poderá registrar hipóteses provisórias antes de concluir o caso.

Cada hipótese deverá permitir:

- Descrever uma possível explicação.
- Vincular cartas que a apoiem.
- Vincular a hipótese a um trecho da linha do tempo.
- Editar ou descartar a hipótese.
- Comparar hipóteses quando houver interpretações concorrentes.

As hipóteses não precisam ser julgadas automaticamente como corretas ou incorretas durante a exploração. O objetivo é estimular o raciocínio e permitir a revisão de ideias conforme novas evidências aparecem.

### 5.9. Resolução do caso

Quando considerar que reuniu e organizou informações suficientes, o jogador poderá abrir a tela de conclusão (liberada conforme 5.7.4).

A tela deverá conter:

- Enunciado da pergunta investigativa.
- Linha do tempo do jogador, visível como painel de consulta.
- Campo de texto livre para apresentar a solução.
- Seleção das cartas que sustentam a resposta.
- Contador de tentativas restantes.
- Botão para enviar a conclusão.
- Aviso antes de consumir uma tentativa.

O jogador terá **até cinco tentativas** por caso.

A contagem de tentativas e de conferências da linha do tempo deve ser persistente e não poderá ser reiniciada simplesmente fechando a tela, atualizando o navegador ou saindo e entrando novamente no caso.

#### Regras de validação

A validação não deve depender exclusivamente de correspondência exata entre palavras. Respostas equivalentes podem ser expressas de maneiras diferentes, especialmente por estudantes com vocabulários distintos.

Para a primeira versão, recomenda-se que cada caso possua:

- Uma solução de referência.
- Variações de respostas aceitas.
- Conceitos ou elementos essenciais que caracterizam uma resposta correta.
- Respostas parcialmente corretas previstas, quando necessário.
- Orientações de feedback para erros comuns.
- Linha do tempo de referência e explicação final baseada em fontes.

A validação poderá começar com regras e respostas alternativas configuradas editorialmente. Caso se adote inteligência artificial em versões futuras, ela deverá ser avaliada quanto à consistência, à segurança, ao custo e ao risco de rejeitar respostas válidas.

A resposta não deverá ser considerada incorreta apenas porque usa palavras diferentes da solução de referência.

O feedback de uma resposta incorreta pode usar a linha do tempo do jogador para orientá-lo (por exemplo, sugerindo rever um trecho específico), desde que não revele a solução.

#### Comportamento após o envio

- **Resposta aceita:** o caso é concluído e o jogador recebe a explicação histórica.
- **Resposta incorreta:** o jogador recebe um feedback orientador, sem a revelação imediata da solução, e pode voltar à cena e à linha do tempo.
- **Tentativas restantes:** o sistema informa quantas ainda estão disponíveis.
- **Quinta tentativa incorreta:** o sistema encerra a etapa de resposta e apresenta a solução comentada, com a linha do tempo de referência e as evidências relevantes.
- **Abandono antes da conclusão:** o progresso da investigação, incluindo a linha do tempo, é preservado.

A forma exata de avaliar respostas parcialmente corretas deverá ser definida durante a produção dos casos e os testes pedagógicos.

## 6. Feedback pedagógico e encerramento

A experiência não deve terminar apenas com uma mensagem de acerto ou erro. O encerramento é uma etapa essencial da aprendizagem.

Após solucionar o caso — ou esgotar as tentativas —, o jogador deverá receber uma explicação que apresente:

- Qual era o problema investigado.
- O que aconteceu no contexto histórico do caso.
- **A linha do tempo de referência, lado a lado com a linha do tempo montada pelo jogador**, destacando o que ele reconstruiu bem e onde a ordem diverge.
- Como cada carta sem data poderia ser situada a partir dos indícios disponíveis.
- Quais cartas não pertenciam à história e por quê.
- Quais evidências eram mais relevantes e como se relacionam.
- Por que a conclusão apresentada é sustentada pelas fontes.
- Quais limites ou ambiguidades existem nas fontes históricas (incluindo posições que permanecem incertas).
- Referências para aprofundamento.

Quando a resposta do jogador estiver correta, a explicação deverá reforçar o raciocínio utilizado. Quando estiver incorreta, o sistema deverá explicar a solução sem humilhar o jogador ou tratar o erro como fracasso pessoal. A comparação entre as linhas do tempo deve ser apresentada como aprendizado, não como correção punitiva.

O jogo poderá reconhecer o esforço investigativo, a exploração de fontes, a qualidade da linha do tempo e a qualidade da justificativa, mas esses indicadores deverão ter função pedagógica, não substituir a compreensão histórica.

## 7. Sistema de casos e conteúdo histórico

Cada caso deverá ser uma unidade de conteúdo independente, configurável e reutilizável.

### Estrutura de um caso

| Campo | Descrição |
| --- | --- |
| Identificação | ID, título, resumo e imagem de capa. |
| Contexto | Período, local, acontecimentos e conceitos históricos envolvidos. |
| Público | Faixa escolar ou nível de complexidade recomendado. |
| Mistério | Pergunta central que orienta a investigação. |
| Narrativa | Introdução e textos que conduzem a experiência. |
| Cenas | Imagens de fundo e respectivas áreas interativas. |
| Objetos | Elementos clicáveis e ações associadas. |
| Evidências / cartas | Documentos, imagens, objetos e descrições coletáveis, com frente e verso da carta, data (se explícita) e indicação editorial de que a carta pertence ou não à sequência relevante. |
| Linha do tempo | Intervalo de início e fim, ordem de referência das cartas, marcos-chave, número mínimo de cartas para liberar a resolução e limite de conferências. |
| Indícios de datação | Para cada carta sem data, os elementos que permitem situá-la e a explicação correspondente. |
| Relações | Ligações de referência entre cartas (causa, consequência, contradição, etc.). |
| Solução | Conclusão de referência e explicação fundamentada. |
| Validação | Respostas alternativas e critérios de aceitação. |
| Feedback | Orientações para erros comuns, pistas graduais da linha do tempo e da resposta final. |
| Referências | Fontes, bibliografia, créditos e informações de direitos autorais. |

### Critérios de qualidade histórica

Todo caso deverá passar por revisão de conteúdo antes da publicação. A revisão deve verificar:

- Precisão factual e contextualização temporal.
- Procedência das fontes e atribuição adequada.
- Distinção entre evidência, inferência e ficção narrativa.
- Adequação pedagógica à faixa etária.
- Coerência entre as cartas, a linha do tempo de referência e a solução.
- **Que toda carta sem data possa ser situada com base em indícios efetivamente disponíveis no caso.**
- **Que os marcos-chave tenham uma única ordem defensável; quando a ordem for historicamente incerta, a carta não deve ser marco-chave.**
- Ausência de contradições acidentais que tornem a solução impossível.
- Representação responsável de grupos sociais e acontecimentos históricos.
- Licenças e direitos de uso de imagens e documentos.

Quando houver dramatização, reconstrução ou diálogo fictício, isso deverá ser indicado de forma apropriada. O jogo não deve inventar documentos e apresentá-los como fontes autênticas.

## 8. Diretrizes de experiência e interface

### Identidade visual

A direção de arte proposta é a de um arquivo investigativo histórico, com elementos visuais que remetam a documentos, mapas, manuscritos e objetos de época.

- **Cenas de investigação:** ambientes ilustrados com objetos detalhados e pistas integradas à composição.
- **Caderno e cartas:** papéis, etiquetas, fichas e organização visual que reforçam a ideia de um arquivo de investigação. As cartas podem lembrar fichas catalográficas ou fotografias presas a um quadro.
- **Linha do tempo:** uma faixa que remeta a um varal de evidências ou a uma régua de arquivo, onde as cartas são presas em ordem.

A estética pode usar papel envelhecido, tons sépia, madeira, mapas, carimbos e tipografia inspirada em documentos históricos. A decoração, entretanto, não deve comprometer o contraste, a legibilidade ou a facilidade de navegação.

### Componentes principais

- Barra superior com nome do caso e progresso.
- Área central de exploração.
- Acesso persistente ao caderno e à linha do tempo.
- Visualizador de objetos e documentos.
- Componente de carta (frente e verso).
- Linha do tempo com área "Fora da história", ligações entre cartas e indicadores de certeza.
- Área de hipóteses.
- Tela de resolução com painel da linha do tempo.
- Tela de encerramento com comparação entre linhas do tempo e explicação histórica.

### Responsividade

O produto deverá funcionar em desktop, tablet e celular.

- **Desktop:** cena ampla com acesso lateral ao caderno; linha do tempo horizontal em painel inferior ou tela dedicada.
- **Tablet:** linha do tempo horizontal com rolagem.
- **Celular:** linha do tempo **vertical**, em tela dedicada, com as cartas em formato compacto que se expandem ao toque.

Em telas menores, o caderno, os documentos e a linha do tempo podem abrir em painéis sobrepostos ou telas dedicadas, preservando o retorno ao ponto exato da investigação.

### Acessibilidade

O MVP deverá prever:

- Navegação por teclado, incluindo a montagem completa da linha do tempo.
- **Alternativa a arrastar e soltar:** cada carta deve ter ações "Mover para antes", "Mover para depois", "Posicionar após…" (com escolha da carta de referência) e "Fora da história", acionáveis por botão, teclado e leitor de tela.
- Anúncio por leitor de tela da nova posição da carta após cada movimento (por exemplo, "Bilhete sem data, posição 3 de 6, entre Registro de visitas e Carta lacrada").
- Áreas interativas com tamanho adequado para toque.
- Indicadores visuais e textuais para objetos selecionáveis.
- Texto alternativo para imagens relevantes e para a frente de cada carta.
- Contraste suficiente e possibilidade de ampliação de texto.
- Transcrições acessíveis de documentos importantes.
- Ausência de dependência exclusiva de cor para comunicar estados (o grau de certeza deve usar rótulo ou ícone, não apenas cor).
- Linguagem clara e instruções objetivas.

## 9. Perfis de acesso e áreas do produto

O produto poderá ser organizado em quatro áreas.

- **Área do estudante:** exploração, caderno, cartas, linha do tempo, hipóteses, resolução de casos e histórico de progresso.
- **Área do professor:** seleção de casos, organização de atividades e visualização do progresso dos alunos (incluindo, em versões futuras, as linhas do tempo montadas), caso esse perfil faça parte do MVP.
- **Biblioteca de casos:** catálogo de investigações por período, tema, dificuldade e objetivo de aprendizagem.
- **Administração de conteúdo:** criação e edição de casos, configuração de cenas, cartas, linha do tempo de referência, marcos-chave, critérios de resposta, referências e publicação.

A biblioteca e a área de administração são importantes para permitir que o jogo cresça sem exigir uma nova implementação de software a cada caso. A área do professor é uma proposta de expansão funcional que precisa ser confirmada como parte da primeira entrega.

## 10. Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Exibir um catálogo de casos disponíveis. | P0 |
| RF-02 | Apresentar o briefing narrativo antes da investigação. | P0 |
| RF-03 | Exibir cenas com objetos interativos. | P0 |
| RF-04 | Abrir objetos, documentos e fontes em visualização detalhada. | P0 |
| RF-05 | Transformar evidências coletadas em cartas no caderno. | P0 |
| RF-06 | Preservar cartas, anotações, linha do tempo e progresso do jogador. | P0 |
| RF-07 | Permitir posicionar, mover, retirar e descartar cartas ("Fora da história") em uma linha do tempo. | P0 |
| RF-08 | Permitir indicar o grau de certeza e justificar a posição de cada carta. | P0 |
| RF-09 | Permitir criar ligações tipificadas entre cartas na linha do tempo. | P0 |
| RF-10 | Oferecer alternativa completa a arrastar e soltar para a linha do tempo. | P0 |
| RF-11 | Conferir a linha do tempo por marcos-chave, com feedback orientador e número limitado de conferências. | P1 |
| RF-12 | Liberar a tela de resolução após o número mínimo de cartas posicionadas. | P0 |
| RF-13 | Permitir registrar hipóteses e justificativas. | P1 |
| RF-14 | Aceitar uma resposta final em texto livre, com seleção das cartas que a sustentam. | P0 |
| RF-15 | Limitar a cinco tentativas de resposta por caso. | P0 |
| RF-16 | Apresentar feedback após cada tentativa. | P0 |
| RF-17 | Exibir solução comentada, linha do tempo de referência comparada à do jogador e fontes ao encerrar o caso. | P0 |
| RF-18 | Disponibilizar conteúdo por tema e dificuldade. | P1 |
| RF-19 | Permitir a criação e edição de casos (incluindo cartas e linha do tempo de referência) por interface administrativa. | P1 |
| RF-20 | Registrar dados de conclusão, montagem da linha do tempo e desempenho investigativo. | P1 |
| RF-21 | Permitir ao professor organizar e acompanhar atividades. | P2 |

Legenda: P0 = essencial para o MVP; P1 = importante, mas pode entrar após a validação do núcleo; P2 = expansão.

> Nota sobre RF-11: se a conferência ficar fora do MVP, a linha do tempo continua funcionando como ferramenta de raciocínio, e a comparação com a referência aparece apenas no encerramento.

### Requisitos não funcionais

- **Desempenho:** cenas, documentos e movimentação de cartas devem responder sem atrasos que prejudiquem a investigação.
- **Confiabilidade:** o progresso, incluindo a linha do tempo, não pode desaparecer em uma atualização ou interrupção normal da sessão.
- **Segurança:** acessos administrativos devem ser protegidos; dados de estudantes devem ter acesso restrito.
- **Integridade das respostas:** a ordem de referência, os marcos-chave, a indicação de cartas irrelevantes e as soluções não devem ser enviados ao navegador antes do encerramento do caso.
- **Privacidade:** coletar somente os dados necessários à operação pedagógica.
- **Compatibilidade:** suportar navegadores modernos em computadores e dispositivos móveis.
- **Manutenibilidade:** permitir novos casos sem alterar a lógica central do jogo.
- **Escalabilidade:** suportar o crescimento da biblioteca e do número de usuários.
- **Acessibilidade:** seguir boas práticas de acessibilidade web, com validação em testes reais.

## 11. Arquitetura técnica recomendada

A arquitetura deverá priorizar uma experiência 2D interativa, fácil de atualizar e que permita adicionar novos casos sem reconstruir o jogo.

### Stack sugerida

| Camada | Tecnologia sugerida | Responsabilidade |
| --- | --- | --- |
| Interface | Next.js + React + TypeScript | Telas, navegação, cenas e interações. |
| Estilização | Tailwind CSS | Layout responsivo e componentes visuais. |
| Cenas interativas | React com camadas de hotspots sobre imagens | Clique em objetos, abertura de documentos e navegação. |
| Linha do tempo | Biblioteca de arrastar e soltar acessível (ex.: dnd-kit) | Ordenação de cartas com suporte a teclado e leitor de tela. |
| Banco de dados | PostgreSQL via Supabase | Casos, cartas, usuários e progresso. |
| Autenticação | Supabase Auth, se houver contas | Controle de acesso de estudantes, professores e administradores. |
| Arquivos | Storage compatível com o Supabase | Ilustrações, documentos e outros materiais do jogo. |
| Hospedagem | Vercel ou serviço equivalente | Publicação da aplicação. |
| Testes | Vitest e Playwright | Testes de regras, fluxos e interface. |

Essa é uma recomendação técnica inicial, não uma exigência definitiva. Para o MVP, não é necessário usar um motor de jogos. Uma interface web 2D com imagens, áreas interativas, cartas e painéis de investigação é suficiente para validar o conceito.

### Modelo de dados inicial

- `users`: perfis e informações mínimas de acesso.
- `cases`: metadados e configurações dos casos, incluindo intervalo da linha do tempo, mínimo de cartas para liberar a resolução e limite de conferências.
- `scenes`: cenários de cada caso.
- `objects`: objetos interativos e suas áreas clicáveis.
- `evidence`: evidências e metadados das fontes, incluindo frente e verso da carta e data explícita (quando houver).
- `case_evidence`: associação das evidências aos casos.
- `timeline_reference` *(privado)*: ordem de referência das cartas, marcos-chave, cartas que não pertencem à história, indícios de datação e pistas graduais.
- `evidence_relations`: ligações de referência entre cartas.
- `case_solutions` *(privado)*: critérios de validação, respostas alternativas e explicações.
- `player_timeline`: cartas posicionadas pelo jogador, ordem, grupos simultâneos, grau de certeza, justificativa e cartas descartadas.
- `player_links`: ligações criadas pelo jogador entre cartas, com tipo e explicação.
- `timeline_checks`: conferências da linha do tempo realizadas e feedback recebido.
- `attempts`: respostas enviadas, cartas selecionadas e número de tentativas utilizadas.
- `player_progress`: estado da investigação, cartas descobertas e conclusão.
- `notes_and_hypotheses`: anotações e hipóteses do jogador.
- `sources_and_references`: referências históricas e créditos editoriais.

O sistema deverá distinguir dados públicos do jogo de dados privados do estudante. A conferência da linha do tempo e a validação das respostas devem ocorrer no servidor; as tabelas marcadas como privadas não devem ser expostas ao navegador antes do encerramento do caso.

## 12. Critérios de aceitação do MVP

O MVP será considerado funcional quando atender aos seguintes critérios:

- [ ] **Iniciar uma investigação:** o jogador consegue selecionar um caso, ler a introdução e entrar na cena.
- [ ] **Explorar objetos:** os objetos interativos podem ser selecionados e apresentam os conteúdos configurados.
- [ ] **Coletar evidências:** uma evidência coletada aparece no caderno como carta e pode ser consultada novamente.
- [ ] **Montar a linha do tempo:** o jogador consegue posicionar, mover, agrupar e retirar cartas, e colocar cartas em "Fora da história".
- [ ] **Justificar posições:** o jogador consegue indicar o grau de certeza e escrever por que cada carta está em determinada posição.
- [ ] **Relacionar cartas:** o jogador consegue criar uma ligação tipificada entre duas cartas e explicá-la.
- [ ] **Montar sem arrastar:** toda a linha do tempo pode ser montada apenas com teclado ou botões.
- [ ] **Preservar progresso:** ao sair e retornar, o jogador mantém cartas, linha do tempo, ligações e anotações.
- [ ] **Liberar a resolução:** a tela de resolução só fica disponível após o mínimo de cartas posicionadas, sem exigir ordem correta.
- [ ] **Enviar uma solução:** o sistema aceita texto livre, registra as cartas selecionadas e a tentativa, sem exigir alternativa de múltipla escolha.
- [ ] **Limitar tentativas:** a quinta tentativa encerra a etapa de respostas, caso não haja uma solução aceita; o contador não reinicia ao recarregar.
- [ ] **Apresentar feedback:** o feedback é coerente com o resultado e não revela a solução nem a ordem correta antes do momento definido.
- [ ] **Explicar o caso:** o encerramento apresenta a solução, a linha do tempo de referência comparada à do jogador, a relação entre as evidências e as referências históricas.
- [ ] **Usar em dispositivos diferentes:** a exploração, a leitura e a montagem da linha do tempo funcionam em computador, tablet e celular.

## 13. Escopo de desenvolvimento

### Incluído no MVP

- Catálogo inicial de casos.
- Um caso completo e jogável para validação, com cartas datadas, cartas sem data e ao menos uma carta que não pertence à história.
- Uma ou mais cenas 2D com objetos interativos.
- Visualização e coleta de evidências como cartas.
- Caderno de investigação.
- Linha do tempo com posicionamento, grau de certeza, justificativas, área "Fora da história" e ligações entre cartas.
- Alternativa acessível a arrastar e soltar.
- Registro de hipóteses ou deduções em texto.
- Campo de solução final em texto livre, apoiado na linha do tempo.
- Limite de cinco tentativas.
- Feedback, solução comentada e comparação entre linhas do tempo.
- Salvamento do progresso.
- Interface responsiva.
- Estrutura de conteúdo que permita adicionar casos posteriormente.

### A confirmar para o MVP

- Conferência da linha do tempo por marcos-chave (RF-11).

### Fora do MVP inicial

- Ambientes 3D ou movimentação livre de personagem.
- Multiplayer e investigações colaborativas em tempo real (incluindo linha do tempo compartilhada entre estudantes).
- Inteligência artificial generativa avaliando todas as respostas.
- Criação automática de casos históricos por IA.
- Editor visual avançado de cenas e de linha do tempo.
- Linha do tempo com escala proporcional de datas (o MVP usa ordem relativa).
- Ranking competitivo entre estudantes.
- Aplicativos nativos para Android e iOS.
- Painel analítico escolar avançado.

Essas funcionalidades poderão ser consideradas depois que a experiência básica for validada.

## 14. Plano de execução

1. **Etapa 1 — Definição do caso-piloto.** Definir o mistério, o período histórico, as fontes, as cartas (datadas, sem data e irrelevantes), a linha do tempo de referência, os marcos-chave, a solução de referência e os critérios pedagógicos.
2. **Etapa 2 — Design da experiência.** Projetar as telas de exploração, o visualizador de evidências, o componente de carta, o caderno, a linha do tempo (desktop e celular) e a tela de resolução.
3. **Etapa 3 — Desenvolvimento do núcleo.** Implementar cenas, objetos clicáveis, coleta de cartas, linha do tempo acessível, ligações entre cartas e persistência do progresso.
4. **Etapa 4 — Sistema de respostas.** Implementar a liberação da resolução, a conferência da linha do tempo (se no MVP), a validação editorial das respostas, os contadores, os feedbacks e o encerramento com comparação de linhas do tempo.
5. **Etapa 5 — Testes técnicos e pedagógicos.** Validar com professores e estudantes, observando compreensão, usabilidade da linha do tempo (inclusive no celular e sem arrastar), coerência histórica, dificuldade e ocorrência de tentativa e erro.
6. **Etapa 6 — Revisão e lançamento piloto.** Corrigir problemas identificados, revisar acessibilidade e publicar uma versão para uso controlado.

A duração de cada etapa deverá ser estimada depois de definir o tamanho do caso-piloto, a disponibilidade das ilustrações e a composição da equipe.

## 15. Riscos e estratégias de mitigação

| Risco | Estratégia |
| --- | --- |
| O jogo parecer um quiz com decoração histórica | Fazer com que a solução dependa da exploração, da reconstrução cronológica e de uma resposta escrita pelo jogador. |
| A linha do tempo virar um quebra-cabeça resolvido por tentativa e erro | Validar só marcos-chave, dar feedback não posicional, limitar conferências e manter a resposta final em texto livre. |
| A linha do tempo virar apenas ordenação de datas | Incluir cartas sem data que exijam inferência e cartas que não pertencem à história. |
| Cartas sem data impossíveis de situar | Exigir, na revisão editorial, que cada carta sem data tenha indícios suficientes no próprio caso. |
| Ordem histórica genuinamente incerta ser tratada como erro | Não usar posições incertas como marcos-chave; permitir que o jogador marque incerteza; explicar as ambiguidades no encerramento. |
| Linha do tempo difícil de usar no celular ou sem arrastar | Layout vertical no celular, ações por botão e teclado, testes de usabilidade em dispositivos reais. |
| Respostas válidas serem rejeitadas | Configurar respostas alternativas, testar paráfrases e revisar os critérios de aceitação. |
| Pistas não sustentarem a conclusão | Exigir revisão editorial das relações entre cartas, da linha do tempo e da solução de referência. |
| Jogadores não perceberem objetos interativos | Usar indicadores discretos, feedback visual e testes de usabilidade. |
| Cenas e cartas ficarem caras e demoradas de produzir | Criar um modelo reutilizável de cena, objeto, carta e documento. |
| Fontes históricas serem interpretadas como verdades absolutas | Explicitar autoria, contexto, limitações e diferença entre data do documento e data dos fatos. |
| Perda de progresso, tentativas ou conferências | Persistir o estado da investigação e validar as regras no servidor. |
| Exposição da ordem correta no navegador | Manter referência e marcos-chave no servidor até o encerramento. |
| Coleta excessiva de dados de estudantes | Minimizar dados pessoais, limitar acessos e revisar requisitos de privacidade, incluindo a LGPD. |

## 16. Decisões que precisam ser confirmadas

O PRD pode orientar a construção do MVP, mas estas decisões afetam o desenho final e devem ser validadas com os responsáveis pelo projeto. Onde há uma proposta adotada nesta versão, ela está indicada.

1. **Qual será o público prioritário?**
   Anos finais do Ensino Fundamental · Ensino Médio · Fundamental e Médio · Outro público

2. **Como o jogo deve avaliar a resposta final?**
   Critérios e respostas alternativas predefinidos · Avaliação por IA com critérios pedagógicos · Modelo híbrido

3. **O professor precisa de painel já no MVP?**
   Sim, desde a primeira versão · Não, pode entrar depois · Ainda não definido

4. **A linha do tempo é obrigatória para liberar a resposta final?**
   *Proposta adotada:* sim, com um número mínimo de cartas posicionadas, sem exigir ordem correta.
   Alternativas: obrigatória com ordem dos marcos-chave correta · totalmente opcional

5. **Como a linha do tempo é conferida?**
   *Proposta adotada:* por marcos-chave, com feedback orientador e 3 conferências por caso, separadas das 5 tentativas de resposta.
   Alternativas: sem conferência (só comparação no encerramento) · conferência consome tentativas de resposta

6. **A linha do tempo substitui o sistema de conexão de pistas?**
   *Proposta adotada:* sim; as conexões viram ligações tipificadas entre cartas dentro da linha do tempo.
   Alternativa: manter um mural de conexões separado

7. **A conferência da linha do tempo entra no MVP?**
   Sim · Não, entra após a validação do núcleo

## 17. Definição de sucesso do produto

O Detetive Histórico terá cumprido seu objetivo inicial quando um estudante conseguir entrar em um cenário histórico, descobrir e interpretar pistas, transformá-las em cartas, reconstruir a sequência dos acontecimentos, estabelecer relações entre evidências e apresentar uma conclusão própria — recebendo, ao final, uma explicação historicamente fundamentada.

O critério mais importante não é apenas se o jogador acertou a resposta ou a ordem das cartas, mas se a experiência o ajudou a compreender como as evidências permitem situar acontecimentos no tempo, construir uma interpretação histórica e perceber por que algumas conclusões são mais bem sustentadas do que outras.

**Próximo passo recomendado:** desenvolver o caso-piloto completo, incluindo roteiro, mapa da cena, lista de objetos clicáveis, conjunto de cartas (datadas, sem data e irrelevantes), indícios de datação, linha do tempo de referência, marcos-chave, ligações esperadas, respostas aceitas e explicação final. Esse material permitirá testar as mecânicas do PRD antes de produzir uma biblioteca maior de casos.