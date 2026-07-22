import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { fetchApi } from '../api';
import { ShieldAlert, Loader2, Key } from 'lucide-react';

export const AdminLogin = () => {
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
      if (data.user.role !== 'ADMIN') {
        toast('Access Denied. Admin privileges required.', 'error');
        return;
      }
      login(data.token, data.user);
      navigate('/admin');
      toast('Admin Access Granted.', 'success');
    } catch (error: any) {
      toast(error.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-[150px] xl:gap-[200px] w-full max-w-7xl mx-auto py-12 lg:py-24 z-10 relative">
      
      {/* Hero Left Column */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
        <div className="relative w-20 h-20 mb-8 hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-red-500/30 animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-red-500/10 bg-red-500/5 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-center text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
             <ShieldAlert size={32} strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight drop-shadow-lg">
          Command<br/>Center.
        </h1>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-slate-300 mb-4 drop-shadow-md">
          Restricted Access Area.
        </h2>
        <p className="text-sm lg:text-base text-gray-500 dark:text-slate-500 font-bold tracking-widest uppercase drop-shadow-sm">
          Authorized Dealership Personnel Only.
        </p>
      </div>

      {/* Auth Panel Right Column */}
      <div className="linear-panel p-8 sm:p-12 rounded-xl w-full max-w-md shrink-0 flex flex-col gap-6 relative z-10 !border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Admin Gateway</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Identify yourself to <strong className="text-red-500">Access Global Inventory</strong></p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type="email" 
            required 
            placeholder="Admin Email" 
            className="p-3 rounded-md linear-input placeholder-gray-400 dark:placeholder-slate-600 text-sm font-medium focus:!border-red-500/50" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            required 
            minLength={6}
            placeholder="Admin Password" 
            className="p-3 rounded-md linear-input placeholder-gray-400 dark:placeholder-slate-600 text-sm font-medium focus:!border-red-500/50" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
          />

          <button 
            type="submit" 
            disabled={loading} 
            className="p-3 mt-2 rounded-md font-bold text-sm flex justify-center items-center gap-2 linear-button hover:!border-red-500/30 hover:!bg-red-500/5"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Key size={16} /> Authenticate</>}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-1 text-sm text-gray-500 dark:text-slate-400 font-medium">
          <Link to="/login" className="w-max self-start hover:text-gray-900 dark:hover:text-white transition-colors text-left">
            Not an admin? Return to standard login
          </Link>
        </div>
      </div>
    </div>
  );
};
