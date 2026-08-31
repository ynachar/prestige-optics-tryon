export const SUPPORTED_LANGS = ['en', 'fr'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'en';
export const LANG_STORAGE_KEY = 'lang';

export function isSupportedLang(value: string | null | undefined): value is AppLang {
  return value === 'en' || value === 'fr';
}

export function resolveStoredLang(): AppLang {
  const saved = localStorage.getItem(LANG_STORAGE_KEY)?.trim().toLowerCase();
  return isSupportedLang(saved) ? saved : DEFAULT_LANG;
}

export function persistLang(lang: string): AppLang {
  const normalized = lang?.trim().toLowerCase();
  const value = isSupportedLang(normalized) ? normalized : DEFAULT_LANG;
  localStorage.setItem(LANG_STORAGE_KEY, value);
  return value;
}
