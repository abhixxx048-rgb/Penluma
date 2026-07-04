/**
 * Reading-time estimation - dependency-free, works on plain text or HTML.
 *
 * The site already uses the `reading-time` npm package in a few Astro
 * components; this is a tiny, typed, zero-dependency equivalent for places
 * that only have a string (e.g. rendered HTML) and don't want to pull the
 * package into client/edge bundles.
 */

export interface ReadingStats {
  /** Estimated reading time in whole minutes (always >= 1 for non-empty text). */
  minutes: number;
  /** Number of words counted after stripping any markup. */
  words: number;
}

/** Words per minute for an average adult reader of web prose. */
const DEFAULT_WPM = 200;

/**
 * Estimate reading time for a body of text or HTML.
 *
 * Strips HTML tags and entities, collapses whitespace, counts words, and
 * divides by `wpm`. Returns `{ minutes: 0, words: 0 }` for empty/absent input
 * so callers can render nothing when there's nothing to read.
 *
 * @param input Plain text or HTML (null/undefined tolerated).
 * @param wpm   Reading speed in words per minute (default 200).
 */
export function estimateReadingTime(
  input: string | null | undefined,
  wpm: number = DEFAULT_WPM,
): ReadingStats {
  if (!input) return { minutes: 0, words: 0 };

  const text = input
    .replace(/<[^>]*>/g, ' ') // drop HTML tags
    .replace(/&[a-z#0-9]+;/gi, ' ') // drop HTML entities (&nbsp; &amp; …)
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return { minutes: 0, words: 0 };

  const words = text.split(' ').length;
  const rate = wpm > 0 ? wpm : DEFAULT_WPM;
  const minutes = Math.max(1, Math.round(words / rate));

  return { minutes, words };
}
