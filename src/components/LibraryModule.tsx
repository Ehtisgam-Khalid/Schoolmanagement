import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Filter, LayoutGrid, List as ListIcon, CheckCircle2, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService } from '../services/api';

export const LibraryModule = ({ user }: { user: any }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    adminService.getLibrary().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: 'Total Books', value: books.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Issued', value: books.filter(b => b.status === 'issued').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Available', value: books.filter(b => b.status === 'available').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Library Terminal</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Registry of Academic Manuscripts</p>
        </div>
        {user.role === 'admin' && (
          <Button className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group">
            <Plus className="h-4 w-4 mr-2" />
            REGISTER NEW ASSET
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-1 border-none shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl">
            <div className="p-6 flex items-center space-x-4">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200/60 shadow-2xl shadow-slate-200/20">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Query Repository..." 
              className="w-full bg-slate-50 border border-transparent rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-slate-200 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setView('grid')}>
              <LayoutGrid className={cn("h-4 w-4", view === 'grid' ? "text-primary" : "text-slate-400")} />
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setView('list')}>
              <ListIcon className={cn("h-4 w-4", view === 'list' ? "text-primary" : "text-slate-400")} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {books.length === 0 ? (
            <div className="py-20 text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Repository Empty</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize cataloging protocol</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {books.map((book) => (
                <motion.div 
                  layout
                  key={book.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    view === 'grid' 
                      ? "p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40"
                      : "flex items-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    view === 'grid' ? "mb-4" : "mr-6"
                  )}>
                    <div className="h-16 w-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors truncate">{book.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{book.author} &bull; {book.isbn}</p>
                    <div className="flex items-center mt-3">
                      {book.status === 'available' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3 mr-1.5" />
                          In Depot
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                          <Clock className="h-3 w-3 mr-1.5" />
                          Delegated
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
