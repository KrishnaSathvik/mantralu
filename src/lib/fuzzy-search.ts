/**
 * Simple fuzzy match: checks if all characters of the query appear
 * in order within the target string. Returns a score (0 = no match,
 * higher = better). Exact substring matches score highest.
 */
export function fuzzyMatch(target: string, query: string): number {
  if (!query || !target) return 0;

  const tLower = target.toLowerCase();
  const qLower = query.toLowerCase();

  // Exact substring → highest score
  if (tLower.includes(qLower)) return 100 + (qLower.length / tLower.length) * 50;

  // Word-start matching (each query token starts a word)
  const queryTokens = qLower.split(/\s+/).filter(Boolean);
  const targetTokens = tLower.split(/\s+/).filter(Boolean);

  if (queryTokens.length > 0) {
    const allTokensMatch = queryTokens.every((qt) =>
      targetTokens.some((tt) => tt.startsWith(qt))
    );
    if (allTokensMatch) return 80;
  }

  // Character-sequence fuzzy
  let qi = 0;
  let consecutiveBonus = 0;
  let lastMatchIdx = -2;

  for (let ti = 0; ti < tLower.length && qi < qLower.length; ti++) {
    if (tLower[ti] === qLower[qi]) {
      if (ti === lastMatchIdx + 1) consecutiveBonus += 5;
      lastMatchIdx = ti;
      qi++;
    }
  }

  if (qi < qLower.length) return 0; // not all chars matched

  return 30 + consecutiveBonus + (qLower.length / tLower.length) * 20;
}

/**
 * Score a mantra against a search query across multiple fields.
 */
export function scoreMantra(
  mantra: {
    title_en: string;
    title_te: string;
    telugu_text: string;
    transliteration: string;
    deity?: { name_en: string; name_te: string } | null;
    category?: { name_en: string; name_te: string } | null;
    tags?: string[] | null;
  },
  query: string
): number {
  const scores = [
    fuzzyMatch(mantra.title_en, query) * 2,       // title weighted 2x
    fuzzyMatch(mantra.title_te, query) * 2,
    fuzzyMatch(mantra.transliteration, query) * 1.5,
    fuzzyMatch(mantra.deity?.name_en || "", query) * 1.8,
    fuzzyMatch(mantra.deity?.name_te || "", query) * 1.8,
    fuzzyMatch(mantra.category?.name_en || "", query) * 1.2,
    fuzzyMatch(mantra.category?.name_te || "", query) * 1.2,
    fuzzyMatch(mantra.telugu_text, query) * 0.5,
    ...(mantra.tags || []).map((t) => fuzzyMatch(t, query) * 1.3),
  ];

  return Math.max(...scores, 0);
}
