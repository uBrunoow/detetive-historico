# Caso real 1 — "A lei de dois artigos" (abolição da escravidão)

Data: 2026-10-20 · Base: Caso 3 do documento "Detetive Histórico — Casos da Versão Inicial"

## Intenção

Primeiro caso com fontes históricas reais, no lugar do caso fictício `demo-biblioteca`. Ele usa a partida que já existe (cena → caderno → linha do tempo → conclusão escrita → encerramento). O documento de casos serve de base de conteúdo. Ele **não** muda a mecânica: não há pistas liberadas aos poucos, nem pontuação, nem dois níveis.

O objetivo pedagógico vem do PRD (§17): o aluno usa fontes datadas e sem data para reconstruir a sequência e explica com as próprias palavras **como e por que** a escravidão terminou no Brasil. A ideia central da revelação: a abolição foi lenta e gradual, e terminou por pressão (abolicionistas, fugas em massa, imprensa). Não foi um presente da princesa.

## Objetivos

- Um caso jogável de ponta a ponta com 7 cartas de fontes reais, conferidas no original e citadas nas referências.
- Cumprir as regras do PRD §7: uma carta sem data situável por indícios, uma carta fora da história, de 2 a 4 marcos-chave com ordem única defensável.
- Linguagem para 11 anos nos textos da equipe. As transcrições mantêm a grafia original.
- Passar em `pnpm verify` (validação do caso, testes e verificação de vazamento).

## Fora do escopo

- Os outros 4 casos do documento.
- Versões Fundamental e Médio separadas.
- Pontuação, pistas progressivas e distintivo próprio por caso (o jogo continua com as medalhas atuais).
- Fotos ou digitalizações de acervos com direitos de uso restritos.

## O que não pode acontecer

- Um documento inventado apresentado como fonte autêntica. Todo texto entre aspas numa carta precisa existir no original.
- Uma explicação que reforce "a princesa libertou os escravos por bondade".
- Imagens de violência ou de corpos de pessoas escravizadas. A arte mostra lugares e objetos.
- Uma transcrição com erro em relação ao original.

## Moldura narrativa

- **Rio de Janeiro, fim de maio de 1888.** A cidade ainda comemora a lei de 13 de maio. O jogador investiga a pergunta: **"Como e por que a escravidão terminou no Brasil?"**
- **Duas cenas, reconstruídas pela equipe** (arte em pixel, mesmo estilo do jogo):
  1. **Redação de um jornal abolicionista**: mesa do redator, parede de recortes, prelo, janela para a rua em festa.
  2. **Escritório de um advogado abolicionista**: estante com a Coleção das Leis do Império, mesa com livros e papéis, retrato na parede.
- O briefing avisa: *"Os lugares e o personagem são uma reconstrução. Os documentos são reais, e cada um indica de onde veio."* (`fictional: false`)
- Objetos de contexto (textos da equipe, não são cartas):
  - José do Patrocínio e o jornal *Cidade do Rio*;
  - Luiz Gama (retrato, com biografia curta e verdadeira);
  - André Rebouças;
  - a rua em festa.
  Eles dão rosto aos abolicionistas negros, como pede o "Para discutir" do documento.
- Um objeto trancado, no mesmo padrão do demo. Qual objeto e qual condição fica a critério de quem constrói.

## As 7 cartas

Na coluna "Situação": ✅ texto conferido no original nesta sessão; ⚠️ falta conferir antes de publicar.

| # | Carta | Data na fonte | Cena | Situação | Papel |
|---|---|---|---|---|---|
| 1 | Lei nº 581 (Lei Eusébio de Queirós) | 4 set. 1850 | Escritório | ✅ Planalto | **Fora da história** |
| 2 | Lei nº 2.040 (Ventre Livre) | 28 set. 1871 | Escritório | ✅ Planalto | **Marco-chave** |
| 3 | Trecho de *O Abolicionismo*, de Joaquim Nabuco | **sem data** (o livro é de 1883) | Escritório | ✅ ed. 1883 digitalizada (UNESP), p. 34–35 | Datável por indícios |
| 4 | Lei nº 3.270 (Sexagenários) | 28 set. 1885 | Escritório | ✅ Planalto | **Marco-chave** |
| 5 | Pedido do Clube Militar à Princesa Regente | out. 1887 | Redação | ⚠️ texto e dia exato a localizar | Prova das fugas em massa |
| 6 | Lei nº 3.353 (Lei Áurea) | 13 maio 1888 | Redação | ✅ Planalto | **Marco-chave** |
| 7 | Missa campal pela abolição (ilustração da equipe inspirada na foto de Antonio Luiz Ferreira, IMS) | 17 maio 1888 | Redação | ✅ dados da foto; ilustração própria | Consequência / celebração |

### Trechos conferidos para as transcrições

- **Lei 581/1850**: ementa "Estabelece medidas para a repressão do trafico de africanos neste Imperio." Assinada por D. Pedro II. A ementa e o artigo 1º são suficientes.
- **Lei 2.040/1871**: "A Princeza Imperial Regente, em nome de Sua Magestade o Imperador e Senhor D. Pedro II, faz saber a todos os subditos do Imperio que a Assembléa Geral Decretou e ella Sanccionou a Lei seguinte: Art. 1º Os filhos de mulher escrava que nascerem no Imperio desde a data desta lei, serão considerados de condição livre." Inclui o § 1º, resumido no verso: o senhor podia usar os serviços do menor até os 21 anos.
- **Lei 3.270/1885**: assinada por **D. Pedro II**, não pela princesa. "§ 10. São libertos os escravos de 60 annos de idade, completos antes e depois da data em que entrar em execução esta Lei; ficando, porém, obrigados, a titulo de indemnização pela sua alforria, a prestar serviços a seus ex-senhores pelo espaço de tres annos."
- **Nabuco**: "que porta ha na lei para o escravo sahir do captiveiro? A lei de 28 de Setembro de 1871 abriu-lhe, mas não facilitou-lhe, dois caminhos: o do resgate forçado pelo pecúlio, e o do sorteio annual." Mais 1 ou 2 frases do mesmo trecho, conferidas no PDF. A carta mostra autor e título, **sem o ano**.
- **Lei 3.353/1888**: texto integral (preâmbulo, art. 1º e 2º, "Dada no Palacio do Rio de Janeiro em 13 de maio de 1888", "PRINCEZA IMPERIAL REGENTE.", Rodrigo Augusto da Silva).
- **Clube Militar**: por enquanto a carta **não tem transcrição**. Ela traz apenas uma descrição da equipe: o Clube Militar, presidido por Deodoro da Fonseca, pediu à Princesa Regente que o Exército não fosse usado para capturar escravizados fugidos. As datas encontradas divergem (25 ou 26 de outubro de 1887), então o dia precisa ser conferido. Se o texto original for localizado, entra a transcrição.

### Grafia

As transcrições mantêm a grafia de época ("extincta", "Princeza"). O **verso** de cada carta explica o documento em português atual e em frases curtas. *(Decisão minha: o aluno de 11 anos tem sempre uma leitura acessível, e a fonte não é alterada.)*

## Linha do tempo de referência

- Começo: **"28 de setembro de 1871 — Lei do Ventre Livre"**. Fim: **"Maio de 1888 — festas da abolição no Rio"**.
- Ordem: 2 (1871) → 3 (Nabuco, 1883) → 4 (1885) → 5 (1887) → 6 (13/5/1888) → 7 (17/5/1888).
- Fora da história: 1 (1850). Motivo: é anterior ao período investigado. Ela proibiu a chegada de africanos escravizados pelo mar, mas não libertou nenhuma pessoa que já estava escravizada. Ajuda a entender o contexto, mas não faz parte da sequência. Isso também ensina a diferença entre fim do *tráfico* e fim da *escravidão*.
- Marcos-chave: 2, 4 e 6. Todos têm data explícita e ordem única.
- Indício de datação da carta 3: ela cita a lei de 1871 como algo já existente, então vem depois de 1871. Fala da escravidão como algo que ainda existe, então vem antes de 1888. Não menciona a libertação dos maiores de 60 anos, o que sugere que é anterior a 1885. A posição exata entre 1871 e 1888 é "provável", e por isso ela **não** é marco-chave.
- `minCardsToResolve`: 4 · conferências: 3 · tentativas: 5.
- Dicas da conferência (rascunho, ajustável):
  - marco faltando: "Uma das leis que mudaram a vida das pessoas escravizadas ainda não está na sua linha."
  - carta estranha entre marcos: "Uma das cartas é de antes do período desta investigação. Confira as datas."
  - par invertido 2/4: "Compare as datas das leis assinadas em 28 de setembro. Elas são de anos diferentes."
  - padrão: "Releia as datas no cabeçalho de cada lei."

## Ligações de referência

- 2 → 4: consequência. A libertação foi feita aos poucos: primeiro os que iam nascer, depois os idosos.
- 3 menciona 2.
- 5 → 6: causou. A pressão das fugas e a recusa do Exército em caçar fugidos tornaram a escravidão impossível de manter.
- 7 é consequência de 6.

## Solução

**Resposta de referência:** a escravidão terminou aos poucos, com leis que adiavam a liberdade (Ventre Livre em 1871, Sexagenários em 1885). O fim veio em 13 de maio de 1888, com a Lei Áurea, depois de anos de pressão de abolicionistas (muitos deles negros, como Luiz Gama, André Rebouças e José do Patrocínio), da imprensa e das fugas em massa de pessoas escravizadas.

**Grupos de conceitos (mínimo de 2 para aceitar):**
- `gradual`: aos poucos, gradual, lento, leis anteriores, ventre livre, sexagenarios, 1871, 1885
- `pressao`: abolicionistas, pressão, luta, fugas, fugiram, quilombos, resistência, campanha, jornais, imprensa, movimento
- `lei-final`: lei aurea, 13 de maio, 1888, lei, princesa assinou

**Respostas parciais:**
- só `lei-final`: "Você encontrou a lei que encerrou a escravidão. Mas por que ela veio só em 1888? Olhe as leis anteriores e o pedido do Clube Militar."
- só `gradual`: "Você viu que foi aos poucos. O que fez o governo finalmente acabar com a escravidão?"

**Erros comuns:**
- "bondade", "presente", "boazinha", "generosa": "A princesa assinou a lei, mas ela veio depois de muita pressão. Quem pressionou?" Os gatilhos ignoram negação, como já funciona hoje.
- "ventre livre libertou todos": "Releia o artigo 1º da lei de 1871: quem ela tornou livre?"

**Explicação no encerramento:** a "Revelação" e o "Para discutir" do documento, mais estes pontos:
- a lei de 1885 obrigava os libertos a trabalhar mais 3 anos;
- a lei de 1888 não deu terra, escola nem trabalho aos libertos;
- o Brasil foi o último país das Américas a abolir a escravidão.

**Limites das fontes:**
- as leis mostram o que o governo decidiu, não como as pessoas viviam;
- Nabuco era um abolicionista branco e escrevia de Londres;
- a carta da missa é uma ilustração da equipe, não a foto.

## Arte

- Script novo em `scripts/pixel-art/`, no mesmo motor do demo: 2 cenas 320×200, capa e miniaturas das 7 cartas.
- A missa é uma ilustração própria e se identifica como tal na carta e nos créditos.
- Os hotspots seguem a grade de porcentagem do demo.

## Referências (entram em `references`)

- Lei nº 581/1850: https://www.planalto.gov.br/ccivil_03/leis/LIM/LIM581.htm
- Lei nº 2.040/1871: https://www.planalto.gov.br/ccivil_03/leis/LIM/LIM2040.htm
- Lei nº 3.270/1885: https://www.planalto.gov.br/ccivil_03/leis/LIM/LIM3270.htm
- Lei nº 3.353/1888: https://www.planalto.gov.br/ccivil_03/leis/LIM/LIM3353.htm
- NABUCO, Joaquim. *O Abolicionismo*. Londres: Abraham Kingdon, 1883 (digitalização UNESP): https://bibdig.biblioteca.unesp.br/bitstreams/85aec6f6-169c-42a1-bb53-57c43bde7ebc/download
- FERREIRA, Antonio Luiz. Missa campal celebrada em ação de graças pela abolição, 17/5/1888. Acervo IMS: https://artsandculture.google.com/asset/outdoor-mass-for-the-abolition-of-slavery-acervo-ims-antonio-luiz-ferreira/fgErIJ8FKV22ZQ
- Clube Militar, pedido à Princesa Regente, out. 1887: acervo a localizar.

## Como fica o caso demo

`demo-biblioteca` continua publicado e visível, com a etiqueta "Conteúdo fictício para testes" que já existe. Na tela de fases, o caso real aparece primeiro. *(Decisão minha: `status: "draft"` esconde o caso por completo em `lib/content/public.ts`, e o demo ainda serve de base para os testes.)*

## Pendências antes de publicar

1. Localizar o texto e o dia exato do pedido do Clube Militar, ou manter a carta só com descrição.
2. Revisão do conteúdo por alguém de História (professora), como pede o PRD §7.

## Deixado para quem constrói

- Disposição exata dos objetos nas cenas, objeto trancado e textos dos objetos de contexto (curtos e verdadeiros).
- Códigos de procedência das cartas (formato `AA-00`).
- Texto final do briefing e das dicas, seguindo o tom do PRODUCT.md.
