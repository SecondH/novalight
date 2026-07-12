import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrandSetupForm } from './BrandSetupForm';
import * as apiClient from '@/lib/api-client';

describe('BrandSetupForm', () => {
  it('submits the four raw intake answers and renders the returned brand profile', async () => {
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

    render(<BrandSetupForm token="test-token" />);

    fireEvent.change(screen.getByLabelText(/tone/i), { target: { value: 'warm and friendly' } });
    fireEvent.change(screen.getByLabelText(/typical customer/i), {
      target: { value: 'local remote workers' },
    });
    fireEvent.change(screen.getByLabelText(/visual style/i), {
      target: { value: 'bright, minimal' },
    });
    fireEvent.change(screen.getByLabelText(/what do you offer/i), {
      target: { value: 'coffee, pastries' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

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

  it('shows the error message when the API call fails', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: false,
      error: { code: 'BUSINESS_ERROR', message: 'A brand profile already exists for this account' },
    });

    render(<BrandSetupForm token="test-token" />);
    fireEvent.change(screen.getByLabelText(/tone/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/typical customer/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/visual style/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/what do you offer/i), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('already exists'));
  });
});
