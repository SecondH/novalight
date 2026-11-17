'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { IdeaCard } from './IdeaCard';
import type { ContentDraft, ContentIdea } from '../types';

/**
 * Real data only -- GET /content/ideas, POST /content/ideas/generate, POST
 * /content/ideas/:id/draft, and the draft-mutation endpoints (ADR-034 "Implement Now"). One
 * known, evidenced API gap (not fabricated around): `GET /content/ideas` does not include each
 * idea's draft (no repository `include`), and there is no endpoint to list existing drafts --
 * so a draft only stays visible in `draftsByIdeaId` for the lifetime of this component/session.
 * Reloading the page will show "Create draft" again for an idea that already has one until the
 * backend adds a list-drafts endpoint or an ideas<->drafts include -- a real, reported gap, see
 * the final report, not a bug in this component.
 */
export function ContentView() {
  const { getToken } = useAuth();
  const t = useTranslations('dashboard.content');
  const tCommon = useTranslations('common');

  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [draftsByIdeaId, setDraftsByIdeaId] = useState<Record<string, ContentDraft>>({});
  const [loadError, setLoadError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creatingDraftForId, setCreatingDraftForId] = useState<string | null>(null);
  const [draftBusyId, setDraftBusyId] = useState<string | null>(null);

  const loadIdeas = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const result = await apiRequest<ContentIdea[]>('/content/ideas', { token });
    if (result.success) {
      setIdeas(result.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  }, [getToken]);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  async function handleGenerateIdeas() {
    setGenerating(true);
    const token = await getToken();
    if (token) {
      const result = await apiRequest<ContentIdea[]>('/content/ideas/generate', {
        method: 'POST',
        token,
      });
      if (result.success) {
        setIdeas((prev) => [...(prev ?? []), ...result.data]);
      }
    }
    setGenerating(false);
  }

  async function handleCreateDraft(ideaId: string) {
    setCreatingDraftForId(ideaId);
    const token = await getToken();
    if (token) {
      const result = await apiRequest<ContentDraft>(`/content/ideas/${ideaId}/draft`, {
        method: 'POST',
        token,
      });
      if (result.success) {
        setDraftsByIdeaId((prev) => ({ ...prev, [ideaId]: result.data }));
      }
    }
    setCreatingDraftForId(null);
  }

  async function withDraftAction(draftId: string, action: () => Promise<void>) {
    setDraftBusyId(draftId);
    await action();
    setDraftBusyId(null);
  }

  function replaceDraft(ideaId: string, draft: ContentDraft) {
    setDraftsByIdeaId((prev) => ({ ...prev, [ideaId]: draft }));
  }

  async function handleApprove(ideaId: string, draftId: string) {
    await withDraftAction(draftId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<ContentDraft>(`/content/drafts/${draftId}/approve`, {
        method: 'POST',
        token,
      });
      if (result.success) replaceDraft(ideaId, result.data);
    });
  }

  async function handleDiscard(ideaId: string, draftId: string) {
    await withDraftAction(draftId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<ContentDraft>(`/content/drafts/${draftId}/discard`, {
        method: 'POST',
        token,
      });
      if (result.success) replaceDraft(ideaId, result.data);
    });
  }

  async function handleEdit(
    ideaId: string,
    draftId: string,
    input: { captionText?: string; visualPromptText?: string },
  ) {
    await withDraftAction(draftId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<ContentDraft>(`/content/drafts/${draftId}`, {
        method: 'PATCH',
        token,
        body: input,
      });
      if (result.success) replaceDraft(ideaId, result.data);
    });
  }

  async function handleSchedule(ideaId: string, draftId: string, scheduledDate: string) {
    await withDraftAction(draftId, async () => {
      const token = await getToken();
      if (!token) return;
      await apiRequest(`/content/drafts/${draftId}/schedule`, {
        method: 'POST',
        token,
        body: { scheduledDate },
      });
      // No draft-state field changes on schedule (approvalState stays APPROVED); the resulting
      // CalendarEntry is visible on the Calendar page (GET /content/calendar), not here.
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button type="button" onClick={handleGenerateIdeas} disabled={generating}>
          <Sparkles className="size-4" aria-hidden="true" />
          {generating ? t('generating') : t('generateIdeas')}
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('errorTitle')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={loadIdeas}>
            {tCommon('retry')}
          </Button>
        </div>
      ) : ideas === null ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{tCommon('loading')}</p>
      ) : ideas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">{t('emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              draft={draftsByIdeaId[idea.id]}
              creatingDraft={creatingDraftForId === idea.id}
              draftBusy={draftBusyId === draftsByIdeaId[idea.id]?.id}
              onCreateDraft={() => handleCreateDraft(idea.id)}
              onApproveDraft={() => handleApprove(idea.id, draftsByIdeaId[idea.id].id)}
              onDiscardDraft={() => handleDiscard(idea.id, draftsByIdeaId[idea.id].id)}
              onEditDraft={(input) => handleEdit(idea.id, draftsByIdeaId[idea.id].id, input)}
              onScheduleDraft={(date) => handleSchedule(idea.id, draftsByIdeaId[idea.id].id, date)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
