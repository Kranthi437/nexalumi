import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LinkChecker } from './LinkChecker.jsx';

function renderPage() {
  return render(
    <MemoryRouter>
      <LinkChecker />
    </MemoryRouter>,
  );
}

describe('LinkChecker page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('validates empty input without calling the API', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /check link/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/enter a website address/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects unsupported protocols without calling the API', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole('textbox', { name: /website address/i }), 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: /check link/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/http and https/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a no-known-threat result from the backend', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        submittedUrl: 'https://example.com',
        hostname: 'example.com',
        classification: 'No Known Threat Found',
        threatIntel: {
          status: 'completed',
          statusLabel: 'Completed',
          provider: 'Google Web Risk',
          matched: false,
          categories: [],
        },
        detectionSource: 'Google Web Risk',
        heuristicWarnings: [],
        checkedAt: '2026-11-10T06:00:00.000Z',
        explanation: 'Google Web Risk completed a lookup and reported no matching threat. No known threat found does not guarantee safety.',
        recommendations: ['Still consider who sent the link.'],
        retryable: false,
      }),
    });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole('textbox', { name: /website address/i }), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /check link/i }));
    expect(await screen.findByRole('heading', { level: 2, name: 'No Known Threat Found' })).toBeInTheDocument();
    expect(screen.getByText(/Google Web Risk completed a lookup/i)).toBeInTheDocument();
    expect(screen.queryByText(/100% safe|guaranteed safe|completely secure/i)).not.toBeInTheDocument();
  });

  it('offers retry after a temporary failure', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: 'The check could not be completed.',
        retryable: true,
      }),
    });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole('textbox', { name: /website address/i }), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /check link/i }));
    expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
