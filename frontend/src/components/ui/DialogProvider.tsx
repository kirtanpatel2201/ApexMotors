import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  confirm: (title: string, description: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = (title: string, description: string) => {
    setOptions({ title, description, confirmText: 'Confirm', cancelText: 'Cancel' });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(false);
  };

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCancel}></div>
          <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{options.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{options.description}</p>
            
            <div className="flex justify-end gap-3">
              <button onClick={handleCancel} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                {options.cancelText}
              </button>
              <button onClick={handleConfirm} className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within DialogProvider');
  return context;
};
