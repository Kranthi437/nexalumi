import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard, LinkChecker, SafetyAcademy } from './PrototypePages.jsx';

function renderWithRouter(element) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('NEXALUMI UI prototype', () => {
  it('shows the workspace overview and all four quick tools', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByRole('heading', { name: /good afternoon, guest/i })).toBeInTheDocument();
    expect(screen.getByText('Email checker')).toBeInTheDocument();
    expect(screen.getByText('QR code checker')).toBeInTheDocument();
  });

  it('shows the link checker form without claiming guaranteed safety', () => {
    renderWithRouter(<LinkChecker />);
    expect(screen.getByRole('heading', { name: 'Check a website link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check link/i })).toBeInTheDocument();
    expect(screen.getAllByText(/does not guarantee safety/i).length).toBeGreaterThan(0);
  });

  it('renders the Safety Academy lesson cards', () => {
    renderWithRouter(<SafetyAcademy />);
    expect(screen.getByRole('heading', { name: 'Safety Academy' })).toBeInTheDocument();
    expect(screen.getByText('Spotting phishing')).toBeInTheDocument();
  });
});
