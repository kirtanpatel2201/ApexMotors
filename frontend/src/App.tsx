import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { DialogProvider } from './components/ui/DialogProvider';
import { AppRoutes } from './components/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DialogProvider>
          <HashRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </HashRouter>
        </DialogProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
