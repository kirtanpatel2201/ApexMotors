import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-2xl border transition-all duration-500 animate-in slide-in-from-bottom-5 fade-in bg-white dark:bg-black ${
              t.type === 'success' ? 'border-green-500 dark:border-green-900' :
              t.type === 'error' ? 'border-red-500 dark:border-red-900' :
              'border-gray-200 dark:border-zinc-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="text-green-500" size={24} />}
            {t.type === 'error' && <AlertCircle className="text-red-500" size={24} />}
            {t.type === 'info' && <Info className="text-blue-500 dark:text-blue-400" size={24} />}
            
            <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{t.message}</p>
            
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
