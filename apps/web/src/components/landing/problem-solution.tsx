import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { SectionHeading } from '@/components/shared/section-heading';

export function ProblemSolution() {
  const t = useTranslations('landing.problemSolution');
  const problems = t.raw('problems') as string[];
  const solutions = t.raw('solutions') as string[];

  return (
    <Section id="product">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-card p-6">
            <h3 className="font-heading text-sm font-semibold text-muted-foreground">
              {t('withoutTitle')}
            </h3>
            <ul className="mt-4 flex flex-col gap-3.5">
              {problems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-primary/25 bg-accent/50 p-6">
            <h3 className="font-heading text-sm font-semibold text-accent-foreground">
              {t('withTitle')}
            </h3>
            <ul className="mt-4 flex flex-col gap-3.5">
              {solutions.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
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
