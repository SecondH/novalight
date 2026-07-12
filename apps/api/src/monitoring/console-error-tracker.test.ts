import { ConsoleErrorTracker } from './console-error-tracker';

const error = jest.fn();
jest.mock('../config/logger', () => ({
  logger: { error: (...args: unknown[]) => error(...args) },
}));

describe('ConsoleErrorTracker', () => {
  it('logs the exception via the existing structured logger, not a new mechanism', () => {
    const tracker = new ConsoleErrorTracker();
    const err = new Error('boom');

    tracker.captureException(err, { requestId: 'req-1' });

    expect(error).toHaveBeenCalledWith(
      { err, requestId: 'req-1' },
      'error_tracked (console fallback -- SENTRY_DSN not set)',
    );
  });
});
