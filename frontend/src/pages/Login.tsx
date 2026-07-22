import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { fetchApi } from '../api';
import { LogIn, Loader2, Key, CarFront } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      login(data.token, data.user);
      navigate('/');
      toast('Welcome back to Apex Motors!', 'success');
    } catch (error: any) {
      toast(error.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-[150px] xl:gap-[200px] w-full max-w-7xl mx-auto py-12 lg:py-24 z-10 relative">
      
      {/* Hero Left Column */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
        <div className="relative w-20 h-20 mb-8 hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-gray-400/30 dark:border-zinc-500/30 animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-gray-400/10 dark:border-zinc-500/10 bg-gray-200/50 dark:bg-zinc-500/5 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-center text-gray-900 dark:text-zinc-100 drop-shadow-md">
             <CarFront size={32} strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-4xl lg:text-6xl xl:text-7xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight drop-shadow-lg">
          The Ultimate Dealership.
        </h1>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-slate-300 mb-4 drop-shadow-md">
          Performance. Luxury. Innovation.
        </h2>
        <p className="text-sm lg:text-base text-gray-500 dark:text-slate-500 font-bold tracking-widest uppercase drop-shadow-sm">
          Browse, Purchase, and Manage Your Fleet.
        </p>
      </div>

      {/* Auth Panel Right Column */}
      <div className="linear-panel p-8 sm:p-12 rounded-xl w-full max-w-md shrink-0 flex flex-col gap-6 relative z-10">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Secure Login</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Access your personalized <strong className="text-gray-900 dark:text-white">Dealership Account</strong></p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type="email" 
            required 
            placeholder="Email Address" 
            className="p-3 rounded-md linear-input placeholder-gray-400 dark:placeholder-slate-600 text-sm font-medium" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            required 
            minLength={6}
            placeholder="Password" 
            className="p-3 rounded-md linear-input placeholder-gray-400 dark:placeholder-slate-600 text-sm font-medium" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
          />

          <button 
            type="submit" 
            disabled={loading} 
            className="p-3 mt-2 rounded-md font-bold text-sm flex justify-center items-center gap-2 linear-button"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Enter Portal</>}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-1 text-sm text-gray-500 dark:text-slate-400 font-medium">
          <Link to="/register" className="w-max self-start hover:text-gray-900 dark:hover:text-white transition-colors text-left">
            Need an account? Register
          </Link>
          <Link to="/admin-login" className="w-max self-start flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors text-left mt-2 text-xs">
            <Key size={14} /> Authorized Personnel Only
          </Link>
        </div>
      </div>
    </div>
  );
};
