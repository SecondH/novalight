import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Primary CTA links to /content (the dashboard entry point) rather than directly to
 * /brand-setup -- middleware already redirects unauthenticated visitors to /sign-in first, and
 * the dashboard layout itself redirects an account-less or brand-less visitor onward to
 * /account-setup or /brand-setup (ADR-034 "Incomplete-onboarding redirect"), so a single link
 * correctly routes both brand-new and returning visitors without guessing their state here.
 * Secondary CTA is a real in-page anchor to #how-it-works.
 */
export function Hero() {
  const t = useTranslations('landing.hero');
  const tones = t.raw('tones') as string[];
  const days = t.raw('days') as string[];

  return (
    <Container className="grid items-center gap-16 pt-16 pb-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
      <div className="flex flex-col items-start gap-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
        <Badge variant="secondary" className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          {t('badge')}
        </Badge>

        <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
          {t('title')}
        </h1>

        <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          {t('subtitle')}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/content"
            className={buttonVariants({ size: 'lg', className: 'h-11 px-6 text-[15px]' })}
          >
            {t('primaryCta')}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
          <a
            href="#how-it-works"
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className: 'h-11 px-6 text-[15px]',
            })}
          >
            {t('secondaryCta')}
          </a>
        </div>
      </div>

      <div
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
        aria-hidden="true"
      >
        <Card className="relative gap-0 border border-border/80 bg-card/80 p-1 shadow-[0_1px_2px_rgba(15,17,26,0.04)] ring-1 ring-foreground/[0.06] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">{t('previewLabel')}</span>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              {t('previewBadge')}
            </Badge>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t('toneLabel')}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tones.map((tone) => (
                  <Badge key={tone} variant="secondary" className="rounded-full">
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/25 bg-accent/60 p-3">
              <p className="text-xs font-medium text-accent-foreground">{t('nextIdeaLabel')}</p>
              <p className="mt-1 text-sm text-foreground">{t('nextIdeaText')}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {t('reelTag')}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {t('awarenessTag')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {days.map((day) => (
                <div
                  key={day}
                  className="rounded-md border border-border/70 bg-secondary/60 px-2 py-2 text-center"
                >
                  <p className="text-[10px] font-medium text-muted-foreground">{day}</p>
                  <div className="mx-auto mt-1.5 h-1.5 w-6 rounded-full bg-primary/40" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
