import { cookies } from 'next/headers';
import { translations, type LanguageMode, type TranslationKey } from './translations';

const STORAGE_KEY = 'mdms-language-mode';

export async function getServerLanguageMode(): Promise<LanguageMode> {
  const cookieStore = await cookies();
  const mode = cookieStore.get(STORAGE_KEY)?.value;
  if (mode === 'english' || mode === 'sinhala' || mode === 'mixed') return mode;
  return 'mixed';
}

export type Translator = (key: TranslationKey) => string;

// Server Component equivalent of useLanguage().t — reads the language cookie
// (mirrored client-side by LanguageContext) since Server Components can't
// use React Context.
export async function getTranslator(): Promise<Translator> {
  const mode = await getServerLanguageMode();
  return (key: TranslationKey) => translations[key]?.[mode] ?? String(key);
}
