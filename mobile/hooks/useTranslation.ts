import { useAuth } from '../context/AuthContext';
import { translations, LanguageCode } from '../constants/translations';

export const useTranslation = () => {
  const { user } = useAuth();
  const lang: LanguageCode = (user?.preferredLanguage as LanguageCode) || 'en';

  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
    let value = (translations[lang] as any)[key] || (translations['en'] as any)[key] || key;
    
    if (params && typeof value === 'string') {
      Object.keys(params).forEach(p => {
        value = (value as string).replace(`{{${p}}}`, String(params[p]));
      });
    }
    
    return value;
  };

  return { t, currentLanguage: lang };
};
