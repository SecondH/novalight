'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BrandSetupField } from '../suggestions';
import { hasSuggestion, addSuggestion, removeSuggestion } from '../suggestion-text';

interface SuggestionChipsProps {
  field: BrandSetupField;
  ids: string[];
  value: string;
  onChange: (next: string) => void;
}

/**
 * Curated, per-vertical suggestion chips that insert/remove their localized label text into the
 * free-text answer -- never a replacement for it. Per the accepted decision (2026-07-14,
 * "Suggestion chips augment free text"): selecting multiple chips and combining them with fully
 * custom text must all work together in the same textarea.
 */
export function SuggestionChips({ field, ids, value, onChange }: SuggestionChipsProps) {
  const t = useTranslations('onboarding.brandSetup');
  const tLabels = useTranslations(`onboarding.brandSetup.suggestions.labels.${field}`);
  const [customValue, setCustomValue] = useState('');

  function toggle(label: string) {
    onChange(
      hasSuggestion(value, label) ? removeSuggestion(value, label) : addSuggestion(value, label),
    );
  }

  function addCustom() {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    onChange(addSuggestion(value, trimmed));
    setCustomValue('');
  }

  const customIsDuplicate = customValue.trim() ? hasSuggestion(value, customValue.trim()) : false;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-medium text-muted-foreground">{t('suggestionsLabel')}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('suggestionsLabel')}>
        {ids.map((id) => {
          const label = tLabels(id);
          const active = hasSuggestion(value, label);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(label)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t('suggestionsHint')}</p>

      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder={t('customPlaceholder')}
          aria-label={t('customPlaceholder')}
          className="flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustom}
          disabled={!customValue.trim() || customIsDuplicate}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {t('customAdd')}
        </Button>
      </div>
    </div>
  );
}
