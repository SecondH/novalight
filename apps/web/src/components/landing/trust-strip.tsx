import { useTranslations } from 'next-intl';
import { ShieldCheck, UserCog, Fingerprint, CalendarClock } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';

const ICONS = [Fingerprint, ShieldCheck, UserCog, CalendarClock];

/** Factual product attributes only -- no metrics, logos, or testimonials, per brief. */
export function TrustStrip() {
  const t = useTranslations('landing.trustStrip');
  const points = t.raw('points') as string[];

  return (
    <Section className="py-4 sm:py-6">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border/70 py-7 sm:grid-cols-4">
          {points.map((label, index) => {
            const Icon = ICONS[index];
            return (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
