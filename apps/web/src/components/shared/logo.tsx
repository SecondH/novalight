import { useTranslations } from 'next-intl';
import { Sparkle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * Text-based wordmark -- no image asset, since there is no real logo file to reference
 * (a placeholder image would misrepresent the brand as more established than it is). The
 * wordmark itself ("NovaLight") is a proper noun and is never translated -- see ADR-033
 * "no hardcoded bilingual strings in components" read together with brand-name invariance.
 */
export function Logo({ className }: { className?: string }) {
  const t = useTranslations('common');

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-1.5 font-heading text-[15px] font-semibold tracking-tight text-foreground',
        className,
      )}
    >
      <Sparkle className="size-4 text-primary" aria-hidden="true" strokeWidth={2.25} />
      {t('appName')}
    </Link>
  );
}
