import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroShowcase } from './hero-showcase';

/**
 * Landing hero v2 (ADR-036): copy on one side, a live-feeling phone feed of real NovaLight
 * agent output on the other.
 *
 * Primary CTA links to /content (the dashboard entry point) rather than directly to
 * /brand-setup -- middleware already redirects unauthenticated visitors to /sign-in first, and
 * the dashboard layout itself redirects an account-less or brand-less visitor onward to
 * /account-setup or /brand-setup (ADR-034 "Incomplete-onboarding redirect"), so a single link
 * correctly routes both brand-new and returning visitors without guessing their state here.
 * Secondary CTA is a real in-page anchor to #how-it-works.
 */
export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative backdrop: two soft glows (accent + warm) over a faded dot grid. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 start-[8%] size-[34rem] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25" />
        <div className="absolute top-24 end-[4%] size-[28rem] rounded-full bg-warm/20 blur-[120px] dark:bg-warm/15" />
        <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_9%,transparent)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
      </div>

      <Container className="grid items-center gap-14 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-24 lg:pb-24">
        <div className="flex flex-col items-start gap-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
          <Badge
            variant="secondary"
            className="h-auto gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs backdrop-blur"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            {t('badge')}
          </Badge>

          <h1 className="text-balance font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
            {t.rich('title', {
              highlight: (chunks) => (
                <span className="bg-linear-to-r from-primary to-warm bg-clip-text text-transparent rtl:bg-linear-to-l">
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/content"
              className={buttonVariants({
                size: 'lg',
                className:
                  'h-12 px-7 text-[15px] shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30',
              })}
            >
              {t('primaryCta')}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className={buttonVariants({
                size: 'lg',
                variant: 'outline',
                className: 'h-12 bg-card/60 px-7 text-[15px] backdrop-blur',
              })}
            >
              {t('secondaryCta')}
            </a>
          </div>
        </div>

        <HeroShowcase />
      </Container>
    </section>
  );
}
