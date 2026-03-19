import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export type Lang = 'en' | 'uz' | 'ru';

const SUPPORTED_LANGS: Lang[] = ['en', 'uz', 'ru'];

const normalizeLang = (value: unknown): Lang | undefined => {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  const short = v.slice(0, 2) as Lang;
  return (SUPPORTED_LANGS as string[]).includes(short) ? short : undefined;
};

export const getRequestLang = (req: any): Lang => {
  const headerLang =
    normalizeLang(req?.headers?.['x-lang']) ??
    normalizeLang(req?.headers?.['x-language']) ??
    normalizeLang(req?.headers?.['accept-language']);

  return headerLang ?? 'en';
};

const MESSAGES = { en, uz, ru } as const satisfies Record<Lang, Record<string, string>>;

export const hasMessageKey = (key: string): boolean => {
  return Boolean(MESSAGES.en[key] || MESSAGES.uz[key] || MESSAGES.ru[key]);
};

export const t = (lang: Lang, key: string): string => {
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? key;
};

export const translateIfKey = (lang: Lang, value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  return hasMessageKey(value) ? t(lang, value) : value;
};

