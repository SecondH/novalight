'use client';

import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { SuggestionChips } from './SuggestionChips';
import { suggestionsFor, type BrandSetupField } from '../suggestions';
import type { Vertical } from '@/lib/verticals';

interface FieldStepProps {
  field: BrandSetupField;
  value: string;
  vertical: Vertical | null;
  onChange: (next: string) => void;
}

export function FieldStep({ field, value, vertical, onChange }: FieldStepProps) {
  const t = useTranslations(`onboarding.brandSetup.fields.${field}`);
  const ids = suggestionsFor(field, vertical);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={field} className="font-heading text-lg font-semibold text-foreground">
          {t('label')}
        </label>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <Textarea
        id={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('placeholder')}
        rows={4}
        required
      />
      <SuggestionChips field={field} ids={ids} value={value} onChange={onChange} />
    </div>
  );
}
