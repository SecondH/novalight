'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  BadgeCheck,
  Bookmark,
  CircleDashed,
  Coffee,
  Film,
  Heart,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  Scissors,
  Send,
  Sparkles,
  UtensilsCrossed,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HERO_SAMPLES, type ContentFormat, type HeroSample, type SampleKey } from './hero-samples';
import { TypewriterText } from './typewriter-text';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

const ROTATE_EVERY_MS = 9000;

const VERTICAL_ICON: Record<SampleKey, LucideIcon> = {
  cafe: Coffee,
  salon: Scissors,
  restaurant: UtensilsCrossed,
};

const FORMAT_ICON: Record<ContentFormat, LucideIcon> = {
  'photo-post': ImageIcon,
  carousel: Layers,
  reel: Film,
  story: CircleDashed,
};

/**
 * Per-vertical art for the featured post. There is no generated image yet (image rendering is
 * a separate, undecided integration -- 024-image-generation-integration.md), so the post shows
 * an abstract gradient derived from each sample's stated visual style, plus the real visual
 * prompt the Visual Prompt Engineer agent wrote for it.
 */
const POST_ART: Record<SampleKey, string> = {
  cafe: 'bg-[radial-gradient(120%_90%_at_20%_15%,oklch(0.86_0.07_75),transparent_60%),radial-gradient(90%_80%_at_85%_90%,oklch(0.55_0.09_50),transparent_65%),linear-gradient(160deg,oklch(0.72_0.08_65),oklch(0.42_0.07_45))]',
  salon:
    'bg-[radial-gradient(110%_90%_at_80%_10%,oklch(0.95_0.03_350),transparent_60%),radial-gradient(90%_80%_at_15%_90%,oklch(0.8_0.09_350),transparent_65%),linear-gradient(160deg,oklch(0.9_0.05_340),oklch(0.72_0.1_355))]',
  restaurant:
    'bg-[radial-gradient(110%_90%_at_25%_20%,oklch(0.84_0.13_70),transparent_60%),radial-gradient(90%_80%_at_80%_85%,oklch(0.5_0.15_30),transparent_65%),linear-gradient(160deg,oklch(0.68_0.16_45),oklch(0.42_0.12_30))]',
};

function splitTones(toneDescriptors: string): string[] {
  return toneDescriptors
    .split(/[,،]/)
    .map((tone) => tone.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * Landing-page "show, don't tell" demo (ADR-036): a phone feed filled with real, unedited
 * NovaLight agent output for three fictional businesses. Purely static content -- no API call,
 * so no AI cost and no abuse surface on a public page. Auto-advances between businesses until
 * the visitor interacts; never animates when the visitor prefers reduced motion.
 */
export function HeroShowcase() {
  const locale = useLocale();
  const t = useTranslations('landing.hero.showcase');
  const samples = HERO_SAMPLES[locale === 'fa' ? 'fa' : 'en'];
  const reducedMotion = usePrefersReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [userTookOver, setUserTookOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const phoneRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const active: HeroSample = samples[activeIndex] ?? samples[0]!;

  // Auto-advance: stops for good once the visitor picks a business, pauses on hover/focus.
  useEffect(() => {
    if (reducedMotion || userTookOver || paused) return;
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % samples.length),
      ROTATE_EVERY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex, reducedMotion, userTookOver, paused, samples.length]);

  // Scroll-linked tilt: the phone starts leaning back and settles flat over the first ~360px.
  // Transform-only and rAF-throttled; skipped entirely under reduced motion.
  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone || reducedMotion) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / 360, 1);
      phone.style.transform = `perspective(1400px) rotateX(${(1 - progress) * 14}deg) scale(${0.95 + progress * 0.05})`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      phone.style.transform = '';
    };
  }, [reducedMotion]);

  const select = useCallback((index: number, focus = false) => {
    setUserTookOver(true);
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  }, []);

  // Arrow keys follow reading direction: in RTL the "next" tab sits to the left.
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forwardKey = locale === 'fa' ? 'ArrowLeft' : 'ArrowRight';
    const backKey = locale === 'fa' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forwardKey) select((index + 1) % samples.length, true);
    else if (event.key === backKey) select((index - 1 + samples.length) % samples.length, true);
    else if (event.key === 'Home') select(0, true);
    else if (event.key === 'End') select(samples.length - 1, true);
    else return;
    event.preventDefault();
  };

  const VerticalIcon = VERTICAL_ICON[active.key];
  const FeaturedFormatIcon = FORMAT_ICON[active.featured.format];
  const panelId = `${baseId}-panel`;

  return (
    <div
      className="relative flex flex-col items-center gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        role="tablist"
        aria-label={t('tablistLabel')}
        className="relative z-10 inline-flex rounded-full border border-border/80 bg-card/80 p-1 shadow-sm backdrop-blur"
      >
        {samples.map((sample, index) => {
          const Icon = VERTICAL_ICON[sample.key];
          const selected = index === activeIndex;
          return (
            <button
              key={sample.key}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${baseId}-tab-${sample.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {t(`verticals.${sample.key}`)}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.key}`}
        className="relative w-full max-w-[19rem]"
      >
        {/* Floating pipeline cards -- desktop only, decorative echoes of the phone content. */}
        <div
          aria-hidden="true"
          className="absolute -start-44 top-16 z-20 hidden w-48 rounded-xl border border-border/80 bg-card/95 p-3 shadow-lg shadow-primary/5 backdrop-blur xl:block motion-safe:animate-float"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            {t('profileLabel')}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {splitTones(active.toneDescriptors).map((tone) => (
              <span
                key={tone}
                className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                {tone}
              </span>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute -end-44 top-[54%] z-20 hidden w-52 rounded-xl border border-border/80 bg-card/95 p-3 shadow-lg shadow-warm/10 backdrop-blur xl:block motion-safe:animate-float-delayed"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <WandSparkles className="size-3 text-warm" />
            {t('visualPromptLabel')}
          </p>
          <p
            dir="ltr"
            className="mt-1.5 line-clamp-4 text-start font-mono text-[10.5px] leading-relaxed text-foreground/80"
          >
            {active.featured.visualPrompt}
          </p>
        </div>

        {/* Entrance animation and scroll tilt live on separate layers: both use `transform`. */}
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-1000">
          <div
            ref={phoneRef}
            className="relative origin-bottom transition-transform duration-300 ease-out will-change-transform"
          >
            {/* Bezel */}
            <div className="relative rounded-[2.6rem] bg-neutral-900 p-2.5 shadow-[0_40px_80px_-30px_rgba(40,30,90,0.45)] ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10">
              <div className="absolute start-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black rtl:translate-x-1/2" />
              <div className="relative flex h-[34rem] flex-col overflow-hidden rounded-[2.1rem] bg-background">
                {/* Status bar */}
                <div className="flex h-10 shrink-0 items-end justify-between px-6 pb-1 text-[11px] font-semibold text-foreground">
                  <span dir="ltr">9:41</span>
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-2 w-3.5 rounded-[3px] bg-foreground/80" />
                    <span className="size-2 rounded-full bg-foreground/80" />
                  </span>
                </div>

                {/* Profile row */}
                <div className="flex shrink-0 items-center gap-2.5 px-3.5 py-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-primary to-warm p-[2px]">
                    <span className="grid size-full place-items-center rounded-full bg-background">
                      <VerticalIcon className="size-4 text-foreground" aria-hidden="true" />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-foreground">
                      {active.businessName}
                      <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    </p>
                    <p dir="ltr" className="truncate text-start text-[11px] text-muted-foreground">
                      @{active.handle}
                    </p>
                  </div>
                  <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                    {t('follow')}
                  </span>
                </div>

                {/* Featured post */}
                <div
                  key={active.key}
                  className={cn(
                    'relative aspect-[4/3.4] shrink-0 overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500',
                    POST_ART[active.key],
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[14px_14px] opacity-40" />
                  <VerticalIcon
                    className="absolute start-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-white/85 drop-shadow-lg rtl:translate-x-1/2"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                  <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                    <FeaturedFormatIcon className="size-3" aria-hidden="true" />
                    {t(`formats.${active.featured.format}`)}
                  </span>
                  <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 backdrop-blur">
                    <Sparkles className="size-3 text-primary" aria-hidden="true" />
                    {t('sampleBadge')}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex shrink-0 items-center gap-3.5 px-3.5 pt-2.5 text-foreground"
                  aria-hidden="true"
                >
                  <Heart className="size-[18px]" />
                  <MessageCircle className="size-[18px]" />
                  <Send className="size-[18px] rtl:-scale-x-100" />
                  <Bookmark className="ms-auto size-[18px]" />
                </div>

                {/* Caption */}
                <div className="shrink-0 px-3.5 pt-2">
                  <p className="sr-only">
                    {t('captionLabel')}: {active.featured.caption}
                  </p>
                  <p
                    className="line-clamp-4 text-[12.5px] leading-relaxed text-foreground"
                    aria-hidden="true"
                  >
                    <span className="font-semibold">{active.handle} </span>
                    <TypewriterText
                      key={`${locale}-${active.key}`}
                      text={active.featured.caption}
                      animate={!reducedMotion}
                    />
                  </p>
                </div>

                {/* Up next */}
                <div className="mt-auto shrink-0 border-t border-border/70 px-3.5 pt-2.5 pb-6">
                  <p className="mb-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    {t('upNext')}
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                      {t('ideasReady', { count: active.ideaCount })}
                    </span>
                  </p>
                  <ul className="grid grid-cols-3 gap-1.5">
                    {active.upNext.map((idea) => {
                      const Icon = FORMAT_ICON[idea.format];
                      return (
                        <li
                          key={idea.topic}
                          className="flex h-[4.4rem] flex-col gap-1 rounded-lg border border-border/70 bg-secondary/60 p-1.5"
                        >
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-primary">
                            <Icon className="size-2.5" aria-hidden="true" />
                            {t(`formats.${idea.format}`)}
                          </span>
                          <span className="line-clamp-3 text-[9.5px] leading-snug text-foreground/85">
                            {idea.topic}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
        {t('sampleNote')}
      </p>
    </div>
  );
}
