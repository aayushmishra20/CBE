import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');
axios.get.mockResolvedValue({ data: [] });

test('renders the CBE workspace and primary workflows', () => {
  render(<App />);
  expect(screen.getByText(/Competency-Based Education/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Add a student/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Analyze a resume/i })).toBeInTheDocument();
});
