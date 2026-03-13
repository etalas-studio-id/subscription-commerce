'use client';

import { useI18n } from '@/lib/i18n-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
      className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-1"
    >
      {language === 'id' ? 'ID' : 'EN'}
    </button>
  );
}
