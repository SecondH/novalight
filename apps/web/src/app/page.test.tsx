import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Page from './page';

// Smoke test only -- proves the test pipeline (Vitest + React Testing Library, per
// docs/architecture/011-frontend-architecture.md "recommended" frontend tooling) actually
// runs against the real app, not a claim about product behavior (there is none yet).
describe('Home page', () => {
  it('renders without crashing', () => {
    render(<Page />);
    expect(document.body).toBeTruthy();
  });
});
