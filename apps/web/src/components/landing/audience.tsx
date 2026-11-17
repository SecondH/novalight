import { useTranslations } from 'next-intl';
import { Scissors, Coffee, Wrench } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { SectionHeading } from '@/components/shared/section-heading';

const ICONS = [Scissors, Coffee, Wrench];

interface Scenario {
  title: string;
  scenario: string;
}

export function Audience() {
  const t = useTranslations('landing.audience');
  const scenarios = t.raw('scenarios') as Scenario[];

  return (
    <Section id="audience" className="bg-secondary/40">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {scenarios.map(({ title, scenario }, index) => {
            const Icon = ICONS[index];
            return (
              <div key={title} className="rounded-xl border border-border/70 bg-card p-6">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{scenario}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
