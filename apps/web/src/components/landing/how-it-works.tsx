import { useTranslations } from 'next-intl';
import { MessageSquareText, Palette, Lightbulb, CalendarCheck } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { SectionHeading } from '@/components/shared/section-heading';

const ICONS = [MessageSquareText, Palette, Lightbulb, CalendarCheck];

interface Step {
  title: string;
  description: string;
}

/**
 * The numbered sequence here is meaningful, not decorative -- this is the actual order the
 * product's real M1 agent pipeline runs in (brand intake -> brand profile -> content ideas ->
 * draft review), not an arbitrary 4-item layout.
 */
export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');
  const steps = t.raw('steps') as Step[];

  return (
    <Section id="how-it-works" className="bg-secondary/40">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = ICONS[index];
            return (
              <li
                key={step.title}
                className="flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
                style={{ animationDelay: `${index * 90}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
