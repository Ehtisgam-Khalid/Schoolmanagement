import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Download, Trash2, Book, FileCode, FileVideo } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService } from '../services/api';

export const StudyMaterialModule = ({ user }: { user: any }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', class: '', type: 'PDF' });

  const fetchMaterials = () => {
    adminService.getMaterials().then(data => {
      setMaterials(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setMaterials([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.addMaterial(newMaterial);
    setIsAdding(false);
    setNewMaterial({ title: '', class: '', type: 'PDF' });
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Verify: Purge resource from depot?')) {
      await adminService.deleteMaterial(id);
      fetchMaterials();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return FileVideo;
      case 'CODE': return FileCode;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Knowledge Repository</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Study Materials & Academic Assets</p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <Button 
            className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            UPLOAD SYLLABUS ASSET
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stage Asset Entry</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Syllabus Synchronization Protocol</p>
            </div>
            <form onSubmit={handleAddMaterial} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Descriptor</label>
                <input 
                  required
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="E.G. ORGANIC CHEMISTRY NOTES"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Node (Class)</label>
                  <input 
                    required
                    value={newMaterial.class}
                    onChange={e => setNewMaterial({...newMaterial, class: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Format</label>
                  <select 
                    value={newMaterial.type}
                    onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="PDF">PDF DOCUMENT</option>
                    <option value="VIDEO">VIDEO LECTURE</option>
                    <option value="CODE">CODE REPO</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 border-slate-200" onClick={() => setIsAdding(false)}>
                  ABORT
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-primary shadow-lg shadow-primary/20">
                  EXECUTE UPLOAD
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {materials.map((mat) => {
          const Icon = getIcon(mat.type);
          return (
            <Card key={mat.id} className="relative overflow-hidden group border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white/80 backdrop-blur-xl">
               <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                     <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Icon className="h-7 w-7" />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Class {mat.class} Node</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">{mat.title}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Format: {mat.type} &bull; Registry: {new Date(mat.createdAt).toLocaleDateString()}</p>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                     <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all">
                        <Download className="h-3 w-3 mr-2" />
                        Pull Resource
                     </Button>
                     {(user.role === 'admin' || user.role === 'teacher') && (
                       <button 
                         onClick={() => handleDelete(mat.id)}
                         className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     )}
                  </div>
               </div>
            </Card>
          );
        })}
        {materials.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Depot Empty</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize material provisioning protocol</p>
          </div>
        )}
      </div>
    </div>
  );
};
