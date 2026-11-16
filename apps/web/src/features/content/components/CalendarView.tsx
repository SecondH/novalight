'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations, useFormatter } from 'next-intl';
import { CalendarClock, Check, X } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CalendarEntry } from '../types';

const STATE_VARIANT: Record<CalendarEntry['postedState'], 'secondary' | 'default' | 'outline'> = {
  SCHEDULED: 'secondary',
  POSTED: 'default',
  DISCARDED: 'outline',
};

/**
 * Real data only -- GET /content/calendar and the reschedule/posted/discard endpoints
 * (ADR-034). Known, evidenced API gap: `CalendarEntry` only carries `contentDraftId` (an FK),
 * not the draft's caption/visual-prompt text (no repository `include`) -- so each entry is
 * honestly shown by its schedule date and a truncated draft reference, not fabricated caption
 * preview text. See the final report.
 */
export function CalendarView() {
  const { getToken } = useAuth();
  const t = useTranslations('dashboard.calendar');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  const [entries, setEntries] = useState<CalendarEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const result = await apiRequest<CalendarEntry[]>('/content/calendar', { token });
    if (result.success) {
      setEntries(result.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  }, [getToken]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  function replaceEntry(entry: CalendarEntry) {
    setEntries((prev) => prev?.map((item) => (item.id === entry.id ? entry : item)) ?? null);
  }

  async function withBusy(id: string, action: () => Promise<void>) {
    setBusyId(id);
    await action();
    setBusyId(null);
  }

  async function handleMarkPosted(entryId: string) {
    await withBusy(entryId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<CalendarEntry>(`/content/calendar/${entryId}/posted`, {
        method: 'POST',
        token,
      });
      if (result.success) replaceEntry(result.data);
    });
  }

  async function handleDiscard(entryId: string) {
    await withBusy(entryId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<CalendarEntry>(`/content/calendar/${entryId}/discard`, {
        method: 'POST',
        token,
      });
      if (result.success) replaceEntry(result.data);
    });
  }

  async function handleReschedule(entryId: string, scheduledDate: string) {
    await withBusy(entryId, async () => {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest<CalendarEntry>(`/content/calendar/${entryId}/reschedule`, {
        method: 'PATCH',
        token,
        body: { scheduledDate },
      });
      if (result.success) replaceEntry(result.data);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('errorTitle')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={loadEntries}>
            {tCommon('retry')}
          </Button>
        </div>
      ) : entries === null ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{tCommon('loading')}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">{t('emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const isDiscarded = entry.postedState === 'DISCARDED';
            const busy = busyId === entry.id;
            return (
              <Card key={entry.id} className={cn('p-4', isDiscarded && 'opacity-60')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t('scheduledFor', {
                          date: format.dateTime(new Date(entry.scheduledDate), {
                            dateStyle: 'medium',
                          }),
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('draftReference', { id: entry.contentDraftId.slice(0, 8) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATE_VARIANT[entry.postedState]}>
                      {t(`states.${entry.postedState}`)}
                    </Badge>
                    {!isDiscarded && entry.postedState === 'SCHEDULED' ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => handleMarkPosted(entry.id)}
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          {t('markPosted')}
                        </Button>
                        <input
                          type="date"
                          aria-label={t('reschedule')}
                          disabled={busy}
                          onChange={(e) =>
                            e.target.value && handleReschedule(entry.id, e.target.value)
                          }
                          className="rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => handleDiscard(entry.id)}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          {t('discard')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
