import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { SectionHeading } from '@/components/shared/section-heading';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';

export function FinalCta() {
  const t = useTranslations('landing.finalCta');

  return (
    <Section className="py-16 sm:py-20">
      <Container className="flex flex-col items-center gap-6 rounded-2xl border border-primary/20 bg-accent/50 px-8 py-14">
        <SectionHeading title={t('title')} description={t('description')} />
        <Link
          href="/content"
          className={buttonVariants({ size: 'lg', className: 'h-11 px-6 text-[15px]' })}
        >
          {t('cta')}
          <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      </Container>
    </Section>
  );
}
