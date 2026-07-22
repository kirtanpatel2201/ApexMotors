import { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import type { Vehicle, Purchase } from '../types';
import { useToast } from '../components/ui/ToastProvider';
import { useDialog } from '../components/ui/DialogProvider';
import { Plus, Edit2, Trash2, PackagePlus, Loader2, Car, DollarSign, History } from 'lucide-react';

export const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    maker: '',
    model: '',
    category: '',
    price: '',
    quantity: '',
    imageUrl: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { confirm } = useDialog();

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesData, purchasesData] = await Promise.all([
        fetchApi('/vehicles'),
        fetchApi('/vehicles/history/purchases')
      ]);
      setVehicles(vehiclesData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({ maker: '', model: '', category: '', price: '', quantity: '', imageUrl: '', description: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      maker: vehicle.maker,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price.toString(),
      quantity: vehicle.quantity.toString(),
      imageUrl: vehicle.imageUrl || '',
      description: vehicle.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      maker: formData.maker,
      model: formData.model,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      ...(formData.imageUrl.trim() ? { imageUrl: formData.imageUrl.trim() } : {}),
      ...(formData.description.trim() ? { description: formData.description.trim() } : {})
    };

    try {
      if (editingId) {
        await fetchApi(`/vehicles/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/vehicles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      await loadData();
      toast(editingId ? 'Vehicle updated' : 'Vehicle created', 'success');
      resetForm();
    } catch {
      toast('Failed to save vehicle', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm('Delete Vehicle', 'Are you sure you want to permanently delete this vehicle from the inventory?');
    if (!isConfirmed) return;
    
    try {
      await fetchApi(`/vehicles/${id}`, { method: 'DELETE' });
      await loadData();
      toast('Vehicle deleted', 'success');
    } catch {
      toast('Failed to delete vehicle', 'error');
    }
  };

  const handleRestock = async (id: string) => {
    const qty = window.prompt('How many units to add?');
    if (!qty || isNaN(parseInt(qty))) return;
    
    try {
      await fetchApi(`/vehicles/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity: parseInt(qty) })
      });
      await loadData();
      toast('Restock successful', 'success');
    } catch {
      toast('Failed to restock vehicle', 'error');
    }
  };

  // Stats Calculations
  const totalVehicles = vehicles.length;
  const totalInventoryValue = vehicles.reduce((acc, v) => acc + (v.price * v.quantity), 0);
  const totalSales = purchases.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 px-4 md:px-8 xl:px-12 pt-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-1">Manage inventory, monitor stock, and analyze value.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold hover:scale-105 active:scale-95 shadow-md shadow-gray-900/10 dark:shadow-white/5"
        >
          <Plus size={18} /> Add New Vehicle
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center gap-5 transition-colors duration-700 ease-in-out">
          <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl text-black dark:text-white">
            <Car size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Models</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalVehicles}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center gap-5 transition-colors duration-700 ease-in-out">
          <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl text-black dark:text-white">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">${totalInventoryValue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center gap-5 transition-colors duration-700 ease-in-out">
          <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl text-black dark:text-white">
            <History size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">${totalSales.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          INVENTORY
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors ${activeTab === 'history' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          PURCHASE HISTORY
        </button>
      </div>

      {activeTab === 'inventory' ? (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors duration-700 ease-in-out">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Inventory List</h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-black dark:text-white" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-5 font-semibold">Make & Model</th>
                  <th className="px-8 py-5 font-semibold">Category</th>
                  <th className="px-8 py-5 font-semibold">Unit Price</th>
                  <th className="px-8 py-5 font-semibold">Status / Stock</th>
                  <th className="px-8 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/30 transition-colors duration-500 group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 dark:text-white text-base">{v.maker}</div>
                      <div className="text-gray-500 dark:text-gray-400 font-medium">{v.model}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">${v.price.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${v.quantity > 2 ? 'bg-black dark:bg-white' : v.quantity > 0 ? 'bg-gray-500' : 'bg-red-500'}`}></div>
                        <span className={`font-semibold ${v.quantity > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
                          {v.quantity} units
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleRestock(v.id)} className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors tooltip" title="Restock">
                          <PackagePlus size={18} />
                        </button>
                        <button onClick={() => openEdit(v)} className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors tooltip" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors tooltip" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors duration-700 ease-in-out">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-black dark:text-white" size={40} /></div>
        ) : purchases.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No purchases found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-5 font-semibold">Date</th>
                  <th className="px-8 py-5 font-semibold">Customer</th>
                  <th className="px-8 py-5 font-semibold">Vehicle</th>
                  <th className="px-8 py-5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/30 transition-colors duration-500 group">
                    <td className="px-8 py-5 font-medium text-gray-500 dark:text-zinc-400">{new Date(p.purchasedAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">{p.user.email}</td>
                    <td className="px-8 py-5 font-medium text-gray-700 dark:text-gray-300">{p.vehicle.maker} {p.vehicle.model}</td>
                    <td className="px-8 py-5 text-right font-black text-gray-900 dark:text-white">${p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h3>
              <button type="button" onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Maker</label>
                  <input type="text" required value={formData.maker} onChange={e => setFormData({...formData, maker: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Model</label>
                  <input type="text" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" placeholder="e.g. Sports, Luxury, SUV" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Unit Price ($)</label>
                  <input type="number" min="0" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Initial Stock</label>
                  <input type="number" min="0" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors resize-none" placeholder="Vehicle specifications and details..."></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">Vehicle Image URL</label>
                <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-600 outline-none transition-colors" placeholder="https://example.com/image.jpg" />
                {formData.imageUrl && (
                  <div className="mt-4 flex justify-center">
                    <img src={formData.imageUrl} alt="Preview" className="h-32 rounded-xl object-cover shadow-sm border border-gray-200 dark:border-zinc-800" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/60">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-gray-600 dark:text-zinc-400 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-gray-900/10 dark:shadow-white/5">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
