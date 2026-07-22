import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogProvider, useDialog } from './DialogProvider';

const TestComponent = () => {
  const { confirm } = useDialog();
  
  const handleAction = async () => {
    const isConfirmed = await confirm('Are you sure?', 'Dangerous action warning');
    if (isConfirmed) {
      document.body.dataset.result = 'confirmed';
    } else {
      document.body.dataset.result = 'cancelled';
    }
  };

  return (
    <button onClick={handleAction}>
      Open Dialog
    </button>
  );
};

describe('DialogProvider', () => {
  it('shows confirmation dialog and resolves on confirm', async () => {
    render(
      <DialogProvider>
        <TestComponent />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Dangerous action warning')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Confirm'));
    
    // Check if the result was recorded asynchronously
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.body.dataset.result).toBe('confirmed');
  });
});
