import "server-only";
import { readCaseFile } from "./files";
import { privateCaseSchema, type PrivateCase } from "./schema";

/**
 * Conteúdo que revela a solução: ordem de referência, marcos-chave, cartas fora da
 * história, indícios de datação, dicas, relações e critérios de resposta.
 *
 * Só pode ser lido em Server Actions / Route Handlers. Nunca passe o retorno inteiro
 * para um Client Component: devolva apenas o resultado da regra (dica, veredito) ou,
 * no encerramento, o recorte necessário.
 */
export async function getPrivateCase(slug: string): Promise<PrivateCase> {
  return privateCaseSchema.parse(await readCaseFile(slug, "solution.json"));
}
