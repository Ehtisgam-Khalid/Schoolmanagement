import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, Bed, Users, ShieldCheck, Waves, Coffee, Clock, Trash2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService, api } from '../services/api';

export const DormitoryModule = ({ user }: { user: any }) => {
  const [dorms, setDorms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDorm, setNewDorm] = useState({ name: '', capacity: '' });

  const fetchDorms = () => {
    adminService.getDormitory().then(data => {
      setDorms(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setDorms([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDorms();
  }, []);

  const handleAddDorm = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.addDormitory({ ...newDorm, occupied: 0 });
    setIsAdding(false);
    setNewDorm({ name: '', capacity: '' });
    fetchDorms();
  };

  const handleDecommission = async (id: string) => {
    if (confirm('Verify: Decommission residential unit?')) {
      await api.delete(`/dormitory/${id}`);
      fetchDorms();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Residential Quad</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Housing protocols & Occupancy Telemetry</p>
        </div>
        {user.role === 'admin' && (
          <Button 
            className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            INITIALIZE HOUSING UNIT
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Initialize Housing Unit</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Residential Protocol v3.0</p>
            </div>
            <form onSubmit={handleAddDorm} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Descriptor</label>
                <input 
                  required
                  value={newDorm.name}
                  onChange={e => setNewDorm({...newDorm, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="E.G. HOSTEL GAMMA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume Capacity (Beds)</label>
                <input 
                  required
                  type="number"
                  value={newDorm.capacity}
                  onChange={e => setNewDorm({...newDorm, capacity: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="200"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 border-slate-200" onClick={() => setIsAdding(false)}>
                  ABORT
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-primary shadow-lg shadow-primary/20">
                  EXECUTE INITIALIZATION
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {dorms.map((unit, i) => (
           <Card key={i} className="p-1 overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <div className="p-6">
                 <div className="flex items-center justify-between mb-6">
                    <div className={`h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                       <Home className="h-6 w-6" />
                    </div>
                    {user.role === 'admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDecommission(unit.id); }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                 </div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{unit.name}</h4>
                 <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy Load</span>
                    <span className="text-xs font-black text-slate-900">{unit.occupied}/{unit.capacity}</span>
                 </div>
                 <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-primary shadow-[0_0_8px_currentColor]`}
                      style={{ width: `${(parseInt(unit.occupied)/parseInt(unit.capacity)) * 100}%` }}
                    />
                 </div>
              </div>
           </Card>
         ))}
         {dorms.length === 0 && (
           <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No residential units mapped</p>
           </div>
         )}
      </div>

      <Card className="" title="Environmental Config" subtitle="Dormitory amenities status">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {[
               { icon: Waves, label: 'Water Supply', status: 'Optimal', active: true },
               { icon: Coffee, label: 'Cafeteria Ops', status: 'Ready', active: true },
               { icon: ShieldCheck, label: 'Night Watch', status: 'Deployed', active: true },
               { icon: Clock, label: 'Power Grid', status: 'Stable', active: true },
            ].map((amenity, i) => (
               <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/60">
                  <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                     <amenity.icon className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{amenity.label}</p>
                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{amenity.status}</p>
                  </div>
               </div>
            ))}
         </div>
      </Card>
    </div>
  );
};
