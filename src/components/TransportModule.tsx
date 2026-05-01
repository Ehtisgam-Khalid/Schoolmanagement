import React, { useState, useEffect } from 'react';
import { Bus, Search, Plus, MapPin, Navigation, Phone, ShieldCheck, Clock, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService } from '../services/api';

export const TransportModule = ({ user }: { user: any }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRoute, setNewRoute] = useState({ name: '', base: '', driverPhone: '' });

  const fetchRoutes = () => {
    adminService.getTransport().then(data => {
      setRoutes(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setRoutes([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.addTransport(newRoute);
    setIsAdding(false);
    setNewRoute({ name: '', base: '', driverPhone: '' });
    fetchRoutes();
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Verify: Terminate transit route?')) {
      await adminService.deleteTransport(id);
      fetchRoutes();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Logistics & Transit</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Fleet Management & Route Synchronization</p>
        </div>
        {user.role === 'admin' && (
          <Button 
            className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            DEPLOY NEW ROUTE
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Deploy Transit Route</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Logistics Protocol v8.4</p>
            </div>
            <form onSubmit={handleAddRoute} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Route Descriptor</label>
                <input 
                  required
                  value={newRoute.name}
                  onChange={e => setNewRoute({...newRoute, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="E.G. SECTOR 7 - DOWNTOWN UNIT"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operations Hub (Base)</label>
                <input 
                  required
                  value={newRoute.base}
                  onChange={e => setNewRoute({...newRoute, base: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="MAIN GATE HUB A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Comms (Phone)</label>
                <input 
                  required
                  value={newRoute.driverPhone}
                  onChange={e => setNewRoute({...newRoute, driverPhone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="+92 3XX XXXXXXX"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 border-slate-200" onClick={() => setIsAdding(false)}>
                  ABORT
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-primary shadow-lg shadow-primary/20">
                  ENGAGE ROUTE
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {routes.length > 0 ? routes.map((route: any) => (
          <Card key={route.id} className="relative overflow-hidden group border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white/80 backdrop-blur-xl">
             <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                   <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <Bus className="h-7 w-7" />
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Route Status</span>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                          Active
                        </span>
                        {user.role === 'admin' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector Designation</p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">{route.name}</h3>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center text-xs font-bold text-slate-600 group/link cursor-pointer">
                         <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center mr-3 group-hover/link:bg-primary/10 group-hover/link:text-primary transition-colors">
                            <MapPin className="h-4 w-4" />
                         </div>
                         <div className="flex-1">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Base Hub</p>
                            <p className="truncate">{route.base}</p>
                         </div>
                      </div>

                      <div className="flex items-center text-xs font-bold text-slate-600 group/link cursor-pointer">
                         <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center mr-3 group-hover/link:bg-primary/10 group-hover/link:text-primary transition-colors">
                            <Phone className="h-4 w-4" />
                         </div>
                         <div className="flex-1">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ops Contact</p>
                            <p className="truncate">{route.driverPhone || "+92 3XX XXXXXXX"}</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <Clock className="h-3.5 w-3.5 text-primary" />
                         <span>ETD: 07:45 AM</span>
                      </div>
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">U{i}</div>
                         ))}
                         <div className="h-8 w-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-black text-white">+12</div>
                      </div>
                   </div>
                </div>
             </div>
             {/* Dynamic background pulse */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all duration-700" />
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center">
             <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Navigation className="h-10 w-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Logistics Deployed</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize transit protocols</p>
          </div>
        )}
      </div>
    </div>
  );
};
