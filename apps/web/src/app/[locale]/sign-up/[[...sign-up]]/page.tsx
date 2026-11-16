import { SignUp } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/shared/container';

export default async function SignUpPage() {
  const t = await getTranslations('auth.signUp');

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <Container className="flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </Container>
      <SignUp />
    </main>
  );
}
