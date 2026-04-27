/**
 * Gera um slug a partir de um título.
 * Ex: "Como aprendi Signals!" → "como-aprendi-signals"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                // separa acentos da letra base
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos
    .replace(/[^a-z0-9\s-]/g, '')    // remove pontuação
    .trim()
    .replace(/\s+/g, '-')            // espaços viram hífens
    .replace(/-+/g, '-');            // remove hífens duplicados
}

/**
 * Converte string CSV de tags em array, removendo vazios e trimando.
 */
export function parseTags(csv: string): string[] {
  return csv
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function tagsToString(tags: string[]): string {
  return tags.map((t) => t.trim().toLowerCase()).filter(Boolean).join(',');
}
