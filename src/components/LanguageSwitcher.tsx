'use client';

import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'id' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('id')}
        className="text-xs rounded-full px-3"
      >
        Bahasa
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-xs rounded-full px-3"
      >
        English
      </Button>
    </div>
  );
}
