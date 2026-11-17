import { getTranslations } from 'next-intl/server';
import { Settings } from 'lucide-react';

/**
 * Honest Future-Scope placeholder -- account/team/billing settings are explicitly excluded
 * from M1 (docs/product/mvp-social-ai/021-mvp-scope.md §4,
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.6). This route exists so
 * the nav's disabled "Settings — coming soon" reference has something real to point to if ever
 * linked, rather than a dead route -- it renders no fabricated settings UI.
 */
export default async function SettingsPage() {
  const t = await getTranslations('dashboard.settingsPlaceholder');

  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <Settings className="size-8 text-muted-foreground" aria-hidden="true" />
      <h1 className="font-heading text-xl font-semibold text-foreground">{t('title')}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t('description')}</p>
    </div>
  );
}
