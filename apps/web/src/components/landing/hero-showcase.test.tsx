import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/i18n-test-utils';
import { HeroShowcase } from './hero-showcase';
import { HERO_SAMPLES } from './hero-samples';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  vi.useRealTimers();
  // jsdom ships no matchMedia; restore that default between tests.
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('HeroShowcase', () => {
  it('renders one tab per sample business with the first one selected', () => {
    renderWithIntl(<HeroShowcase />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Café', 'Beauty salon', 'Restaurant']);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain(HERO_SAMPLES.en[0]!.businessName);
  });

  it('switches the phone content when a business is picked', () => {
    renderWithIntl(<HeroShowcase />);

    fireEvent.click(screen.getByRole('tab', { name: /restaurant/i }));

    expect(screen.getByRole('tab', { name: /restaurant/i }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByRole('tabpanel').textContent).toContain('Sofreh Kitchen');
  });

  it('labels the content as real, unedited AI output from a fictional brief', () => {
    renderWithIntl(<HeroShowcase />);

    expect(screen.getByText('Real AI output')).toBeTruthy();
    expect(screen.getByText(/fictional brief, shown unedited/i)).toBeTruthy();
  });

  it('gives screen readers the full caption even while the visual caption is still typing', () => {
    renderWithIntl(<HeroShowcase />);

    const caption = HERO_SAMPLES.en[0]!.featured.caption;
    expect(screen.getByText(`Caption: ${caption}`).className).toContain('sr-only');
  });

  it('moves between tabs with arrow keys in reading direction (LTR)', () => {
    renderWithIntl(<HeroShowcase />);

    fireEvent.keyDown(screen.getAllByRole('tab')[0]!, { key: 'ArrowRight' });
    expect(screen.getAllByRole('tab')[1]?.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(screen.getAllByRole('tab')[1]!, { key: 'End' });
    expect(screen.getAllByRole('tab')[2]?.getAttribute('aria-selected')).toBe('true');
  });

  it('in Persian, renders Persian samples and ArrowLeft moves forward (RTL)', () => {
    renderWithIntl(<HeroShowcase />, { locale: 'fa' });

    expect(screen.getByRole('tabpanel').textContent).toContain(HERO_SAMPLES.fa[0]!.businessName);
    fireEvent.keyDown(screen.getAllByRole('tab')[0]!, { key: 'ArrowLeft' });
    expect(screen.getAllByRole('tab')[1]?.getAttribute('aria-selected')).toBe('true');
  });

  it('auto-advances to the next business when motion is allowed', () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    renderWithIntl(<HeroShowcase />);

    act(() => {
      vi.advanceTimersByTime(9100);
    });

    expect(screen.getAllByRole('tab')[1]?.getAttribute('aria-selected')).toBe('true');
  });

  it('with reduced motion: no auto-advance and the caption is shown in full immediately', () => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    renderWithIntl(<HeroShowcase />);

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(screen.getAllByRole('tab')[0]?.getAttribute('aria-selected')).toBe('true');
    const visualCaption = screen
      .getByRole('tabpanel')
      .querySelector('p[aria-hidden="true"].line-clamp-4');
    expect(visualCaption?.textContent).toContain(HERO_SAMPLES.en[0]!.featured.caption);
  });
});
