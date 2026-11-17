import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithIntl } from '@/test/i18n-test-utils';
import { BrandSetupForm } from './BrandSetupForm';
import * as apiClient from '@/lib/api-client';

const getToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken }),
}));

async function fillAllStepsAndReachReview() {
  fireEvent.change(screen.getByLabelText(/tone/i), { target: { value: 'warm and friendly' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByLabelText(/typical customer/i), {
    target: { value: 'local remote workers' },
  });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByLabelText(/visual style/i), {
    target: { value: 'bright, minimal' },
  });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByLabelText(/what do you offer/i), {
    target: { value: 'coffee, pastries' },
  });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
}

describe('BrandSetupForm', () => {
  beforeEach(() => {
    getToken.mockReset();
    getToken.mockResolvedValue('test-token');
    sessionStorage.clear();
  });

  it('walks through all four steps, reaches the review step, and submits the four raw intake answers', async () => {
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: true,
      data: {
        id: 'brand-1',
        toneDescriptors: 'warm',
        audienceDescription: 'locals',
        visualStyleDescriptors: 'bright',
        offeringsSummary: 'coffee',
      },
    });

    renderWithIntl(<BrandSetupForm />);

    await fillAllStepsAndReachReview();

    // Now on the review step.
    expect(screen.getByText('warm and friendly')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /confirm brand profile/i }));

    await waitFor(() => expect(screen.getByText('warm')).toBeTruthy());

    expect(apiRequestSpy).toHaveBeenCalledWith('/brands/intake', {
      method: 'POST',
      token: 'test-token',
      body: {
        rawToneAnswer: 'warm and friendly',
        rawAudienceAnswer: 'local remote workers',
        rawVisualAnswer: 'bright, minimal',
        rawOfferingsAnswer: 'coffee, pastries',
      },
    });
  });

  it('inserts a suggestion chip into the free-text answer without replacing it, and prevents duplicates', async () => {
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: true,
      data: { vertical: 'CAFE' },
    });

    renderWithIntl(<BrandSetupForm />);
    // Let the mount-time GET /accounts/me effect settle before interacting, so its resulting
    // state update doesn't land outside of act().
    await waitFor(() =>
      expect(apiRequestSpy).toHaveBeenCalledWith('/accounts/me', { token: 'test-token' }),
    );

    const toneTextarea = screen.getByLabelText(/tone/i) as HTMLTextAreaElement;
    fireEvent.change(toneTextarea, { target: { value: 'Casual' } });

    const warmChip = screen.getByRole('button', { name: 'Warm', pressed: false });
    fireEvent.click(warmChip);
    expect(toneTextarea.value).toBe('Casual, Warm');

    // Clicking the same chip again removes it (toggle), rather than duplicating.
    fireEvent.click(screen.getByRole('button', { name: 'Warm', pressed: true }));
    expect(toneTextarea.value).toBe('Casual');
  });

  it('shows the error message when the API call fails', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: false,
      error: { code: 'BUSINESS_ERROR', message: 'A brand profile already exists for this account' },
    });

    renderWithIntl(<BrandSetupForm />);
    await fillAllStepsAndReachReview();
    fireEvent.click(screen.getByRole('button', { name: /confirm brand profile/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('already exists'));
  });

  it('shows an error and does not call the API when no session token is available (expired session)', async () => {
    getToken.mockResolvedValue(null);
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest');

    renderWithIntl(<BrandSetupForm />);
    await fillAllStepsAndReachReview();
    fireEvent.click(screen.getByRole('button', { name: /confirm brand profile/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('session has expired'),
    );
    expect(apiRequestSpy).not.toHaveBeenCalled();
  });

  it('restores in-progress answers from sessionStorage (survives a locale-switch remount)', () => {
    sessionStorage.setItem(
      'novalight.brandSetup.v1',
      JSON.stringify({
        step: 1,
        answers: { tone: 'saved tone', audience: '', visual: '', offerings: '' },
      }),
    );

    renderWithIntl(<BrandSetupForm />);

    expect(screen.getByLabelText(/typical customer/i)).toBeTruthy();
  });
});
