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
      screen.getByRole('heading', { name: /Digital Service Book & Vehicle History/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('backend-status')).toBeInTheDocument();
    expect(screen.getByText(/2019 Škoda Octavia Combi 2.0 TDI/i)).toBeInTheDocument();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Create Free Account')).toBeInTheDocument();
  });

  it('navigates to login page when Sign In is clicked', async () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('link', { name: /Sign In/i });
    fireEvent.click(signInButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sign In to PitBox/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows error on login with empty fields', async () => {
    render(<App />);
    const signInButtons = screen.getAllByRole('link', { name: /Sign In/i });
    fireEvent.click(signInButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    });

    const form = screen.getByRole('button', { name: /^Sign In$/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    });
  });

  it('navigates to register page and validates password mismatch', async () => {
    render(<App />);
    const createAccountBtn = screen.getByRole('link', { name: /Create Account/i });
    fireEvent.click(createAccountBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Your PitBox Account/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@pitbox.io' } });
    fireEvent.change(screen.getByLabelText(/^Password \(min. 6 characters\)$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'different123' } });

    const form = screen.getByRole('button', { name: /Create Account/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated users trying to access /garage back to /login', async () => {
    window.history.pushState({}, '', '/garage');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sign In to PitBox/i })).toBeInTheDocument();
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
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alex@pitbox.io' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Alex Parker!/i)).toBeInTheDocument();
      expect(screen.getByText(/My Garage/i)).toBeInTheDocument();
    });
  });
});
