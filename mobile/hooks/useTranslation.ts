import { useAuth } from '../context/AuthContext';
import { translations, LanguageCode } from '../constants/translations';

export const useTranslation = () => {
  const { user } = useAuth();
  const lang: LanguageCode = (user?.preferredLanguage as LanguageCode) || 'en';

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return { t, currentLanguage: lang };
};
