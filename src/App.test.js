import { act, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import api from './api';

jest.mock('./api', () => ({ get: jest.fn() }));

test('renders the resume analyzer and loads the sample job library', async () => {
  api.get.mockResolvedValue({
    data: [{
      id: 'fe-react-01',
      title: 'Frontend Developer',
      company: 'NovaTech Labs',
      location: 'Bengaluru',
      type: 'Full-time',
      experience: '0–2 years',
      category: 'Engineering',
      description: 'Build React applications with JavaScript and CSS.',
      requiredSkills: ['React'],
      preferredSkills: [],
      minExperience: 0
    }]
  });

  render(<App />);

  expect(screen.getByRole('heading', { name: /find your next opportunity/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /upload your resume/i })).toBeInTheDocument();

  // Flush the resolved API promise and its resulting React state updates inside act().
  await act(async () => {
    await Promise.resolve();
  });

  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/jobs'));
  expect(await screen.findByRole('option', { name: /frontend developer/i })).toBeInTheDocument();
});
