export type Language = 'es' | 'en';

export function detectLanguageFrom(
  saved: string | null,
  languages: string[],
): Language {
  if (saved === 'es' || saved === 'en') return saved;
  return languages.some((item) => item.toLowerCase().startsWith('es'))
    ? 'es'
    : 'en';
}
