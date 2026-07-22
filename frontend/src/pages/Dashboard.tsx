import { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import type { Vehicle } from '../types';
import { Search, Loader2, Info, ChevronRight, ImageOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi(`/vehicles/search?q=${search}`);
      setVehicles(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12 px-4 md:px-8 xl:px-12 pt-6 w-full">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[300px] flex items-center linear-panel border border-gray-200 dark:border-none bg-white dark:bg-black transition-colors duration-700">
        <img 
          src="https://images.unsplash.com/photo-1563720225603-514c9c84e1b0?q=80&w=2000&auto=format&fit=crop" 
          alt="Luxury cars in showroom" 
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-50 mix-blend-luminosity grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 dark:from-black dark:via-black/80 to-transparent transition-colors duration-700"></div>
        <div className="relative z-10 px-10 md:px-16 w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-700">
            Find Your <span className="text-gray-400 dark:text-gray-300">Perfect Drive</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl transition-colors duration-700">Browse our meticulously curated selection of premium and luxury vehicles. Experience excellence without compromise.</p>
          
          <form onSubmit={handleSearch} className="flex max-w-xl relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Make, Model, or Category..."
              className="w-full pl-6 pr-36 py-4 bg-gray-100/80 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-white/20 focus:border-gray-400 dark:focus:border-white outline-none transition-all duration-700 ease-in-out shadow-sm"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 rounded-full font-bold transition-colors duration-700 ease-in-out flex items-center gap-2 shadow-md">
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Featured Inventory <ChevronRight className="text-gray-400" />
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-black dark:text-white" size={48} />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-700 ease-in-out">
          <div className="bg-gray-50 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No vehicles found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">We couldn't find any vehicles matching your search. Try adjusting your filters or browsing the full inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {vehicles.map((vehicle, index) => (
            <div 
              key={vehicle.id} 
              className="linear-panel rounded-3xl overflow-hidden flex flex-col group animate-in slide-in-from-bottom-4 relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-56 relative overflow-hidden bg-gray-100 dark:bg-zinc-950 flex items-center justify-center">
                {vehicle.imageUrl ? (
                  <img 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.maker} ${vehicle.model}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center'); }}
                  />
                ) : (
                  <div className="text-gray-300 dark:text-zinc-800 flex flex-col items-center gap-2">
                    <ImageOff size={48} />
                    <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="backdrop-blur-md bg-black/30 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-white/20">
                    {vehicle.category}
                  </span>
                </div>
                {vehicle.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <span className="text-white text-lg font-bold px-6 py-2 border-2 border-white/50 rounded-full rotate-[-12deg]">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-zinc-50 transition-colors leading-tight">
                      {vehicle.maker}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm mt-0.5">{vehicle.model}</p>
                  </div>
                  <span className="font-black text-xl text-gray-900 dark:text-zinc-50">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mb-0.5">Availability</span>
                    <span className={`text-sm font-bold ${vehicle.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {vehicle.quantity > 0 ? `${vehicle.quantity} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 linear-button hover:scale-105 active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
