import { NextRequest } from 'next/server';
import { isPublicRoute } from './middleware';

function requestFor(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3010'));
}

describe('isPublicRoute', () => {
  it('treats the marketing home page as public', () => {
    expect(isPublicRoute(requestFor('/'))).toBe(true);
  });

  it('treats sign-in and its sub-routes as public', () => {
    expect(isPublicRoute(requestFor('/sign-in'))).toBe(true);
    expect(isPublicRoute(requestFor('/sign-in/factor-one'))).toBe(true);
  });

  it('treats sign-up and its sub-routes as public', () => {
    expect(isPublicRoute(requestFor('/sign-up'))).toBe(true);
  });

  it('treats every other route as protected by default', () => {
    expect(isPublicRoute(requestFor('/brand-setup'))).toBe(false);
    expect(isPublicRoute(requestFor('/some-future-dashboard-page'))).toBe(false);
  });
});
