/**
 * Basic App component test
 * Validates that the testing infrastructure is working
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('contains application content', () => {
    render(<App />);
    // Check for any rendered content (header, navigation, etc.)
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });
});