import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import api from './api';

jest.mock('./api', () => ({
  get: jest.fn()
}));

test('renders the CBE workforce readiness workspace', async () => {
  api.get.mockResolvedValue({ data: [] });
  render(<App />);
  expect(screen.getByRole('heading', { name: /workforce readiness/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /student records/i })).toBeInTheDocument();
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/students'));
});
