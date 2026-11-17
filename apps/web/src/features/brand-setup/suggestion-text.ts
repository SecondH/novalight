/**
 * Toggle-style insert/remove of a suggestion's localized label into a free-text answer.
 * Deliberately simple (substring match, comma-joined) -- these are guided-intake fragments an
 * AI agent interprets downstream, not grammatically-parsed structured data, so exact-sentence
 * precision isn't required, only "the same suggestion is never silently duplicated."
 */
export function hasSuggestion(text: string, label: string): boolean {
  return text.toLowerCase().includes(label.toLowerCase());
}

export function addSuggestion(text: string, label: string): string {
  if (hasSuggestion(text, label)) return text;
  const trimmed = text.trim();
  return trimmed ? `${trimmed}, ${label}` : label;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function removeSuggestion(text: string, label: string): string {
  const pattern = new RegExp(`,?\\s*${escapeRegExp(label)}`, 'i');
  return text.replace(pattern, '').replace(/^,\s*/, '').trim();
}
