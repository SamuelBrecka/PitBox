import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders PitBox branding title and navigation', () => {
    render(<App />);
    expect(screen.getByText('PitBox')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Digital Service Book & Vehicle History/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('backend-status')).toBeInTheDocument();
  });
});
