import { z } from "zod";

/**
 * Formato dos arquivos de um caso.
 *
 * Cada caso vive em `content/cases/<slug>/` com dois arquivos:
 * - `case.json`     → conteúdo público (pode ir para o navegador);
 * - `solution.json` → conteúdo privado (só o servidor lê, e só libera no encerramento).
 *
 * Os schemas são `strict`: uma chave desconhecida é erro, para que nada que revele a
 * solução escape para o arquivo público por engano.
 */

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "use letras minúsculas, números e hífens");
const text = z.string().trim().min(1);
const percent = z.number().min(0).max(100);

export const imageSchema = z.strictObject({
  src: text,
  alt: text,
});

export const hotspotSchema = z
  .strictObject({ x: percent, y: percent, w: percent, h: percent })
  .refine((h) => h.x + h.w <= 100 && h.y + h.h <= 100, "o hotspot ultrapassa os limites da cena");

/**
 * Como o documento é desenhado no visualizador (papel, letra, carimbo).
 * É só apresentação: o conteúdo continua sendo a transcrição, legível por leitor de tela.
 */
export const presentationSchema = z.strictObject({
  /** typed: datilografado · handwritten: manuscrito · printed: impresso (jornal) · ledger: livro pautado com linhas de registro · drawing: desenho/mapa (mostra a imagem) */
  style: z.enum(["typed", "handwritten", "printed", "ledger", "drawing"]),
  paper: z.enum(["office", "lined", "aged", "newsprint", "receipt"]).optional(),
  /** Cabeçalho impresso do papel (timbre, título do jornal). */
  heading: text.optional(),
  stamp: z.strictObject({ text, detail: text.optional() }).optional(),
});

export const objectTypeSchema = z.enum(["evidence", "reading", "context", "locked", "decorative"]);

/** Uma alternativa de época do veredito (A a E). A certa fica em `epochAnswer` (arquivo privado). */
export const epochOptionSchema = z.strictObject({
  title: text,
  years: text,
});

/** Pergunta de múltipla escolha com a resposta no arquivo privado (`quizAnswers`). */
export const quizSchema = z.strictObject({
  question: text,
  options: z.array(text).length(3),
});

/** Cadeado de código: o código certo fica em `codes` (arquivo privado). */
export const codeUnlockSchema = z.strictObject({
  code: z.strictObject({
    prompt: text,
    hint: text,
    inputMode: z.enum(["numeric", "text"]),
  }),
  lockedMessage: text,
});

const examinedUnlockSchema = z.strictObject({
  requiresExamined: z.array(id).min(1),
  lockedMessage: text,
});

export const sceneObjectSchema = z.strictObject({
  id,
  type: objectTypeSchema,
  label: text,
  hotspot: hotspotSchema,
  content: z
    .strictObject({
      title: text.optional(),
      text: text,
      transcription: text.optional(),
      presentation: presentationSchema.optional(),
    })
    .optional(),
  evidenceId: id.optional(),
  unlock: z.union([examinedUnlockSchema, codeUnlockSchema]).optional(),
});

export const sceneSchema = z.strictObject({
  id,
  name: text,
  image: imageSchema,
  objects: z.array(sceneObjectSchema).min(1),
});

export const evidenceSchema = z.strictObject({
  id,
  code: z.string().regex(/^[A-Z]{2}-\d{2}$/, "código de procedência no formato AA-00"),
  title: text,
  sourceType: text,
  image: imageSchema,
  description: text,
  transcription: text.optional(),
  provenance: text,
  author: text.optional(),
  /** Data explícita presente na própria fonte. Ausente = carta sem data. */
  date: z
    .strictObject({
      iso: z.iso.date().optional(),
      label: text,
    })
    .optional(),
  back: text,
  presentation: presentationSchema.default({ style: "typed" }),
  /** Enigma opcional: montar a carta rasgada. */
  puzzle: z.literal("pieces").optional(),
  /** Pergunta opcional sobre a fonte (resposta em `quizAnswers`). */
  quiz: quizSchema.optional(),
});

export const referenceSchema = z.strictObject({
  kind: z.enum(["source", "bibliography", "credit"]),
  text,
  url: z.url().optional(),
});

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const publicCaseSchema = z.strictObject({
  slug: id,
  status: z.enum(["draft", "published"]),
  /** Posição na tela de fases (menor primeiro). */
  order: z.number().int().nonnegative().default(100),
  /** Caso de treino: aparece primeiro, com a etiqueta "Tutorial". */
  tutorial: z.boolean().default(false),
  /** Conteúdo ainda em revisão: mostra a etiqueta "Beta". */
  beta: z.boolean().default(false),
  fictional: z.boolean(),
  title: text,
  summary: text,
  cover: imageSchema,
  place: text,
  audience: text,
  question: text,
  briefing: z.array(text).min(1),
  difficulty: difficultySchema,
  durationMinutes: z.number().int().positive(),
  minCardsToResolve: z.number().int().positive(),
  maxTimelineChecks: z.number().int().nonnegative().default(3),
  /** As cinco épocas do veredito, em ordem cronológica; a certa fica em `epochAnswer`. */
  epochOptions: z.array(epochOptionSchema).length(5),
  startSceneId: id,
  scenes: z.array(sceneSchema).min(1),
  evidence: z.array(evidenceSchema).min(1),
  references: z.array(referenceSchema),
});

export const linkTypeSchema = z.enum(["caused", "consequence_of", "confirms", "contradicts", "mentions"]);

export const hintConditionSchema = z.discriminatedUnion("type", [
  /** Dois marcos-chave aparecem na ordem trocada na linha do jogador. */
  z.strictObject({ type: z.literal("milestones_inverted"), pair: z.tuple([id, id]) }),
  /** Alguma carta que não pertence à história está entre os marcos-chave. */
  z.strictObject({ type: z.literal("irrelevant_between_milestones") }),
  /** Algum marco-chave não está na zona da linha do tempo. */
  z.strictObject({ type: z.literal("milestone_missing") }),
  /** Dica genérica, usada quando nenhuma condição específica se aplica. */
  z.strictObject({ type: z.literal("default") }),
]);

export const privateCaseSchema = z.strictObject({
  /** Índice (0 a 4) da época certa em `epochOptions`. */
  epochAnswer: z.number().int().min(0).max(4),
  /** Código de cada objeto trancado por código. */
  codes: z.record(id, text).optional(),
  quizAnswers: z
    .record(id, z.strictObject({ correct: z.number().int().nonnegative(), explanation: text }))
    .optional(),
  timelineReference: z
    .array(
      z.strictObject({
        evidenceId: id,
        /** Cartas simultâneas compartilham o mesmo número. `null` para quem está fora da história. */
        referenceOrder: z.number().int().positive().nullable(),
        belongsToStory: z.boolean(),
        isKeyMilestone: z.boolean(),
        /** Como situar a carta: obrigatório para cartas sem data que pertencem à história. */
        datingClueExplanation: text.optional(),
        /** Por que a carta não pertence à história. */
        outsideReason: text.optional(),
      }),
    )
    .min(1),
  timelineHints: z
    .array(
      z.strictObject({
        level: z.number().int().positive(),
        condition: hintConditionSchema,
        text,
      }),
    )
    .min(1),
  evidenceRelations: z.array(
    z.strictObject({
      from: id,
      to: id,
      type: linkTypeSchema,
      explanation: text,
    }),
  ),
  solution: z.strictObject({
    referenceAnswer: text,
    explanation: z.array(text).min(1),
    sourceLimitations: z.array(text),
    conceptGroups: z
      .array(
        z.strictObject({
          id,
          label: text,
          synonyms: z.array(text).min(1),
        }),
      )
      .min(1),
    minGroupsToAccept: z.number().int().positive(),
    /** Respostas inteiras aceitas como estão (comparadas já normalizadas). */
    acceptedVariants: z.array(text),
    partialAnswers: z.array(
      z.strictObject({
        requiredGroups: z.array(id).min(1),
        feedback: text,
      }),
    ),
    commonErrors: z.array(
      z.strictObject({
        triggers: z.array(text).min(1),
        feedback: text,
      }),
    ),
    defaultPartialFeedback: text,
    defaultRejectedFeedback: text,
  }),
});

export type PublicCase = z.infer<typeof publicCaseSchema>;
export type PrivateCase = z.infer<typeof privateCaseSchema>;
export type EpochOption = z.infer<typeof epochOptionSchema>;
export type CodeUnlock = z.infer<typeof codeUnlockSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type SceneObject = z.infer<typeof sceneObjectSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type LinkType = z.infer<typeof linkTypeSchema>;
