'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DraftCard } from './DraftCard';
import type { ContentDraft, ContentIdea } from '../types';

interface IdeaCardProps {
  idea: ContentIdea;
  draft: ContentDraft | undefined;
  creatingDraft: boolean;
  draftBusy: boolean;
  onCreateDraft: () => void;
  onApproveDraft: () => void;
  onDiscardDraft: () => void;
  onEditDraft: (input: { captionText?: string; visualPromptText?: string }) => void;
  onScheduleDraft: (scheduledDate: string) => void;
}

export function IdeaCard({
  idea,
  draft,
  creatingDraft,
  draftBusy,
  onCreateDraft,
  onApproveDraft,
  onDiscardDraft,
  onEditDraft,
  onScheduleDraft,
}: IdeaCardProps) {
  const t = useTranslations('dashboard.content.ideaCard');
  const format = useFormatter();

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">{idea.topic}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{idea.intendedFormat}</Badge>
            <span className="text-xs text-muted-foreground">
              {t('targetDate', {
                date: format.dateTime(new Date(idea.targetDate), { dateStyle: 'medium' }),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {draft ? (
          <DraftCard
            draft={draft}
            busy={draftBusy}
            onApprove={onApproveDraft}
            onDiscard={onDiscardDraft}
            onEdit={onEditDraft}
            onSchedule={onScheduleDraft}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateDraft}
            disabled={creatingDraft}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {creatingDraft ? t('creatingDraft') : t('createDraft')}
          </Button>
        )}
      </div>
    </Card>
  );
}
