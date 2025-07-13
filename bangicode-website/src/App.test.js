import { render, screen } from '@testing-library/react';
import App from './App';

test('renders get started button', () => {
  render(<App />);
  const linkElement = screen.getByText(/Get Started/i);
  expect(linkElement).toBeInTheDocument();
});
