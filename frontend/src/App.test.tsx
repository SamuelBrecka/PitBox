import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import { authApi } from './api/client';

describe('PitBox Frontend Application', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('renders PitBox branding, navigation, and landing teaser', () => {
    render(<App />);
    expect(screen.getAllByText('PitBox').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /Digitálna servisná knižka a história vozidla/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('backend-status')).toBeInTheDocument();
    expect(screen.getByText(/2019 Škoda Octavia Combi 2.0 TDI/i)).toBeInTheDocument();
    expect(screen.getAllByText('Prihlásiť sa').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Vytvoriť bezplatný účet')).toBeInTheDocument();
  });

  it('navigates to login page when Prihlásiť sa is clicked', async () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('link', { name: /Prihlásiť sa/i });
    fireEvent.click(signInButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Prihlásenie do PitBoxu/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/E-mailová adresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heslo/i)).toBeInTheDocument();
  });

  it('shows error on login with empty fields', async () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('link', { name: /Prihlásiť sa/i });
    fireEvent.click(signInButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Prihlásiť sa$/i })).toBeInTheDocument();
    });

    const form = screen.getByRole('button', { name: /^Prihlásiť sa$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
      expect(screen.getByText('Vyplňte prosím všetky polia.')).toBeInTheDocument();
    });
  });

  it('navigates to register page and validates password mismatch', async () => {
    render(<App />);
    const createAccountBtn = screen.getByRole('link', { name: /Vytvoriť účet/i });
    fireEvent.click(createAccountBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vytvorte si účet PitBox/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Celé meno/i), { target: { value: 'Jana Nováková' } });
    fireEvent.change(screen.getByLabelText(/E-mailová adresa/i), { target: { value: 'jana@pitbox.io' } });
    fireEvent.change(screen.getByLabelText(/^Heslo \(min\. 6 znakov\)$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Potvrdiť heslo/i), { target: { value: 'different123' } });

    const form = screen.getByRole('button', { name: /Vytvoriť účet/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeInTheDocument();
      expect(screen.getByText('Heslá sa nezhodujú.')).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated users trying to access /garage back to /login', async () => {
    window.history.pushState({}, '', '/garage');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Prihlásenie do PitBoxu/i })).toBeInTheDocument();
    });
  });

  it('successfully logs in and renders garage dashboard with user name', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      token: 'mock-jwt-token',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'alex@pitbox.io',
        fullName: 'Alex Parker',
        role: 'ROLE_USER',
      },
    });

    window.history.pushState({}, '', '/login');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/E-mailová adresa/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/E-mailová adresa/i), { target: { value: 'alex@pitbox.io' } });
    fireEvent.change(screen.getByLabelText(/Heslo/i), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /^Prihlásiť sa$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vitajte späť, Alex Parker!/i)).toBeInTheDocument();
      expect(screen.getByText(/Moja garáž/i)).toBeInTheDocument();
    });
  });
});
