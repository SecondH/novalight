import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { SectionHeading } from '@/components/shared/section-heading';
import { Badge } from '@/components/ui/badge';

/**
 * Explicitly separated per brief -- must never imply publishing, analytics, or image generation
 * are live. Every "available now" item corresponds to a real, backend-verified endpoint/agent;
 * "coming next" items have no implementation yet.
 */
export function Capabilities() {
  const t = useTranslations('landing.capabilities');
  const availableNow = t.raw('availableNow') as string[];
  const comingNext = t.raw('comingNext') as string[];

  return (
    <Section>
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-success/30 bg-success/[0.06] p-6">
            <Badge className="gap-1.5 bg-success text-success-foreground">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {t('availableNowBadge')}
            </Badge>
            <ul className="mt-5 flex flex-col gap-3.5">
              {availableNow.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-6">
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {t('comingNextBadge')}
            </Badge>
            <ul className="mt-5 flex flex-col gap-3.5">
              {comingNext.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
