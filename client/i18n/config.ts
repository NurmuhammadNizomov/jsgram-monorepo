export const locales = ["en", "ru", "uz"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
