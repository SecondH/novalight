'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Check, X, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ContentDraft } from '../types';

interface DraftCardProps {
  draft: ContentDraft;
  busy: boolean;
  onApprove: () => void;
  onDiscard: () => void;
  onEdit: (input: { captionText?: string; visualPromptText?: string }) => void;
  onSchedule: (scheduledDate: string) => void;
}

const STATE_VARIANT: Record<ContentDraft['approvalState'], 'secondary' | 'default' | 'outline'> = {
  DRAFT: 'secondary',
  EDITED: 'secondary',
  APPROVED: 'default',
  DISCARDED: 'outline',
};

export function DraftCard({
  draft,
  busy,
  onApprove,
  onDiscard,
  onEdit,
  onSchedule,
}: DraftCardProps) {
  const t = useTranslations('dashboard.content.draftCard');
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(draft.captionText ?? '');
  const [visualPrompt, setVisualPrompt] = useState(draft.visualPromptText ?? '');
  const [scheduleDate, setScheduleDate] = useState('');

  function saveEdit() {
    onEdit({ captionText: caption, visualPromptText: visualPrompt });
    setIsEditing(false);
  }

  const isDiscarded = draft.approvalState === 'DISCARDED';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/30 p-4',
        isDiscarded && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant={STATE_VARIANT[draft.approvalState]}>
          {t(`states.${draft.approvalState}`)}
        </Badge>
        {!isEditing && !isDiscarded ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="size-3.5" aria-hidden="true" />
            {t('edit')}
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`caption-${draft.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {t('captionLabel')}
            </label>
            <Textarea
              id={`caption-${draft.id}`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`visual-${draft.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {t('visualPromptLabel')}
            </label>
            <Textarea
              id={`visual-${draft.id}`}
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={saveEdit} disabled={busy}>
              <Check className="size-3.5" aria-hidden="true" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t('captionLabel')}</p>
            <p className="mt-0.5 text-sm text-foreground">{draft.captionText}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t('visualPromptLabel')}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{draft.visualPromptText}</p>
          </div>
        </div>
      )}

      {!isDiscarded && !isEditing ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
          {draft.approvalState !== 'APPROVED' ? (
            <Button type="button" size="sm" onClick={onApprove} disabled={busy}>
              <Check className="size-3.5" aria-hidden="true" />
              {t('approve')}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={onDiscard} disabled={busy}>
            <X className="size-3.5" aria-hidden="true" />
            {t('discard')}
          </Button>

          {draft.approvalState === 'APPROVED' ? (
            <div className="ms-auto flex items-center gap-2">
              <label htmlFor={`schedule-${draft.id}`} className="text-xs text-muted-foreground">
                {t('scheduleDateLabel')}
              </label>
              <input
                id={`schedule-${draft.id}`}
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!scheduleDate || busy}
                onClick={() => onSchedule(scheduleDate)}
              >
                <CalendarPlus className="size-3.5" aria-hidden="true" />
                {t('schedule')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
