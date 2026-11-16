'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BrandSetupField } from '../suggestions';

const FIELD_ORDER: BrandSetupField[] = ['tone', 'audience', 'visual', 'offerings'];

interface ReviewStepProps {
  answers: Record<BrandSetupField, string>;
  onEdit: (stepIndex: number) => void;
}

export function ReviewStep({ answers, onEdit }: ReviewStepProps) {
  const t = useTranslations('onboarding.brandSetup');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t('reviewTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('reviewDescription')}</p>
      </div>
      <dl className="flex flex-col gap-4">
        {FIELD_ORDER.map((field, index) => (
          <div key={field} className="rounded-lg border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  {t(`summaryLabels.${field}`)}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{answers[field] || '—'}</dd>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(index)}>
                <Pencil className="size-3.5" aria-hidden="true" />
                {t('editAnswer')}
              </Button>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
