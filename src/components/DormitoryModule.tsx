import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, Bed, Users, ShieldCheck, Waves, Coffee, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { adminService } from '../services/api';

export const DormitoryModule = ({ user }: { user: any }) => {
  const [dorms, setDorms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDormitory().then(data => {
      setDorms(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Residential Quad</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Housing protocols & Occupancy Telemetry</p>
        </div>
        {user.role === 'admin' && (
          <Button className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group">
            <Plus className="h-4 w-4 mr-2" />
            INITIALIZE HOUSING UNIT
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { icon: Home, label: 'Hostel Alpha', cap: '200', occupied: '185', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
           { icon: Bed, label: 'Hostel Beta', cap: '150', occupied: '142', color: 'text-blue-500', bg: 'bg-blue-500/10' },
           { icon: Users, label: 'Staff Quarters', cap: '50', occupied: '48', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           { icon: ShieldCheck, label: 'Secure Wing', cap: '20', occupied: '12', color: 'text-orange-500', bg: 'bg-orange-500/10' },
         ].map((unit, i) => (
           <Card key={i} className="p-1 overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <div className="p-6">
                 <div className={`h-12 w-12 rounded-2xl ${unit.bg} ${unit.color} flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                    <unit.icon className="h-6 w-6" />
                 </div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{unit.label}</h4>
                 <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy Load</span>
                    <span className="text-xs font-black text-slate-900">{unit.occupied}/{unit.cap}</span>
                 </div>
                 <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${unit.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}
                      style={{ width: `${(parseInt(unit.occupied)/parseInt(unit.cap)) * 100}%` }}
                    />
                 </div>
              </div>
           </Card>
         ))}
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
