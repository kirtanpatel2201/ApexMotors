import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastProvider';

const TestComponent = () => {
  const { toast } = useToast();
  return (
    <button onClick={() => toast('Test Message', 'success')}>
      Show Toast
    </button>
  );
};

describe('ToastProvider', () => {
  it('shows a toast message when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show Toast'));
    
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });
});
