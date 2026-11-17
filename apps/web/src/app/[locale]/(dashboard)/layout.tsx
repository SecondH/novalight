import { DashboardNav } from '@/features/dashboard/components/DashboardNav';
import { OnboardingGate } from '@/features/dashboard/components/OnboardingGate';
import { Container } from '@/components/shared/container';

/**
 * Application shell for the two real M1 modules (ADR-034): Content and Calendar. Access is
 * already protected-by-default via src/middleware.ts (ADR-029); `OnboardingGate` additionally
 * redirects a signed-in visitor who hasn't completed account/brand setup yet to the right step.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav />
      <OnboardingGate>
        <Container className="flex-1 py-8 sm:py-10">{children}</Container>
      </OnboardingGate>
    </div>
  );
}
