import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithIntl } from '@/test/i18n-test-utils';
import { CalendarView } from './CalendarView';
import * as apiClient from '@/lib/api-client';

const getToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken }),
}));

describe('CalendarView', () => {
  beforeEach(() => {
    getToken.mockReset();
    getToken.mockResolvedValue('test-token');
  });

  it('shows the empty state when nothing is scheduled', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({ success: true, data: [] });
    renderWithIntl(<CalendarView />);
    expect(await screen.findByText('Nothing scheduled yet')).toBeTruthy();
  });

  it('lists real calendar entries and marks one as posted via the real endpoint', async () => {
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest').mockImplementation(async (path) => {
      if (path === '/content/calendar') {
        return {
          success: true,
          data: [
            {
              id: 'entry-1',
              contentDraftId: 'draft-12345678',
              scheduledDate: '2026-07-21T00:00:00.000Z',
              postedState: 'SCHEDULED',
            },
          ],
        };
      }
      if (path === '/content/calendar/entry-1/posted') {
        return {
          success: true,
          data: {
            id: 'entry-1',
            contentDraftId: 'draft-12345678',
            scheduledDate: '2026-07-21T00:00:00.000Z',
            postedState: 'POSTED',
          },
        };
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderWithIntl(<CalendarView />);

    expect(await screen.findByText(/draft #draft-12/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /mark as posted/i }));

    await waitFor(() => expect(screen.getByText('Posted')).toBeTruthy());
    expect(apiRequestSpy).toHaveBeenCalledWith('/content/calendar/entry-1/posted', {
      method: 'POST',
      token: 'test-token',
    });
  });
});
