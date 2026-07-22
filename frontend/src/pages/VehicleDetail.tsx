import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import type { Vehicle } from '../types';
import { useToast } from '../components/ui/ToastProvider';
import { Loader2, ArrowLeft, ShieldCheck, Gauge, ShoppingCart, ImageOff } from 'lucide-react';

export const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/vehicles');
      const found = data.find((v: Vehicle) => v.id === id);
      if (found) setVehicle(found);
    } catch (error) {
      toast('Failed to load vehicle details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!vehicle) return;
    setPurchasing(true);
    try {
      await fetchApi(`/vehicles/${vehicle.id}/purchase`, { method: 'POST' });
      toast('Purchase successful! Thank you.', 'success');
      await loadVehicle();
    } catch {
      toast('Failed to purchase vehicle. You may need to log in, or it might be out of stock.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-400 dark:text-gray-500" size={48} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center h-[60vh] text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Vehicle Not Found</h2>
        <button onClick={() => navigate('/')} className="linear-button px-6 py-2.5 rounded-full font-bold">Return Home</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-500 max-w-7xl">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8 font-semibold tracking-wide uppercase text-sm"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-zinc-950 flex items-center justify-center linear-panel border-none shadow-2xl p-4">
            {vehicle.imageUrl ? (
              <img 
                src={vehicle.imageUrl} 
                alt={`${vehicle.maker} ${vehicle.model}`}
                className="w-full h-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-700 ease-in-out"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center'); }}
              />
            ) : (
              <div className="text-gray-300 dark:text-zinc-800 flex flex-col items-center gap-4">
                <ImageOff size={80} />
                <span className="font-black uppercase tracking-widest text-xl">No Image</span>
              </div>
            )}
            
            <div className="absolute top-6 left-6">
              <span className="backdrop-blur-xl bg-white/50 dark:bg-black/50 text-black dark:text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 dark:border-white/10 shadow-lg">
                {vehicle.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-2">
              {vehicle.maker}
            </h1>
            <h2 className="text-3xl font-bold text-gray-500 dark:text-zinc-400">
              {vehicle.model}
            </h2>
          </div>

          <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-zinc-800">
            <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
              ${vehicle.price.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              USD
            </span>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Overview</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
              {vehicle.description || "No detailed description provided for this vehicle. Contact a representative for full specifications and history."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="linear-panel p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-full text-gray-900 dark:text-white"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Category</p>
                <p className="font-bold text-gray-900 dark:text-white capitalize">{vehicle.category}</p>
              </div>
            </div>
            <div className="linear-panel p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-full text-gray-900 dark:text-white"><Gauge size={24} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Stock Status</p>
                <p className={`font-bold ${vehicle.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {vehicle.quantity > 0 ? `${vehicle.quantity} Available` : 'Sold Out'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={vehicle.quantity === 0 || purchasing}
            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-500 ${
              vehicle.quantity === 0 
                ? 'bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-zinc-700 cursor-not-allowed border border-gray-200 dark:border-zinc-800' 
                : 'bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/20'
            }`}
          >
            {purchasing ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>Purchase Vehicle <ShoppingCart size={24} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
