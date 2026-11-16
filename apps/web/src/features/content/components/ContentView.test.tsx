import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithIntl } from '@/test/i18n-test-utils';
import { ContentView } from './ContentView';
import * as apiClient from '@/lib/api-client';

const getToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken }),
}));

describe('ContentView', () => {
  beforeEach(() => {
    getToken.mockReset();
    getToken.mockResolvedValue('test-token');
  });

  it('shows the empty state when there are no ideas yet', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({ success: true, data: [] });

    renderWithIntl(<ContentView />);

    expect(await screen.findByText('No content ideas yet')).toBeTruthy();
  });

  it('shows the error state with a retry action when loading fails', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: false,
      error: { code: 'SYSTEM_ERROR', message: 'boom' },
    });

    renderWithIntl(<ContentView />);

    expect(await screen.findByText("We couldn't load your content")).toBeTruthy();
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
  });

  it('lists real ideas and creates a draft for one via the real endpoint', async () => {
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest').mockImplementation(async (path) => {
      if (path === '/content/ideas') {
        return {
          success: true,
          data: [
            {
              id: 'idea-1',
              topic: 'Morning routine',
              intendedFormat: 'Reel',
              targetDate: '2026-07-20T00:00:00.000Z',
            },
          ],
        };
      }
      if (path === '/content/ideas/idea-1/draft') {
        return {
          success: true,
          data: {
            id: 'draft-1',
            contentIdeaId: 'idea-1',
            captionText: 'A great caption',
            visualPromptText: 'A great visual',
            approvalState: 'DRAFT',
          },
        };
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderWithIntl(<ContentView />);

    expect(await screen.findByText('Morning routine')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /create draft/i }));

    await waitFor(() => expect(screen.getByText('A great caption')).toBeTruthy());
    expect(apiRequestSpy).toHaveBeenCalledWith('/content/ideas/idea-1/draft', {
      method: 'POST',
      token: 'test-token',
    });
  });
});
