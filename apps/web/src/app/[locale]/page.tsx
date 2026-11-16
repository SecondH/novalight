import { Hero } from '@/components/landing/hero';
import { TrustStrip } from '@/components/landing/trust-strip';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Capabilities } from '@/components/landing/capabilities';
import { Audience } from '@/components/landing/audience';
import { FinalCta } from '@/components/landing/final-cta';
import { Footer } from '@/components/shared/footer';

export default function Home() {
  return (
    <>
      <main id="main-content" className="flex-1">
        <Hero />
        <TrustStrip />
        <ProblemSolution />
        <HowItWorks />
        <Capabilities />
        <Audience />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
