import { useTranslations } from 'next-intl';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';

/**
 * Minimal and credible per the brief -- no links to routes that don't exist yet (no privacy
 * policy or terms page exists in this repo, so none are linked; adding a dead link would fail
 * the "no dead links" requirement).
 */
export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border/70">
      <Container className="flex flex-col items-center gap-3 py-10 text-center sm:flex-row sm:justify-between sm:text-start">
        <Logo />
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </Container>
    </footer>
  );
}
