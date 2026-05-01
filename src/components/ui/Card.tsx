import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Card = ({ className, title, subtitle, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-slate-200/60 bg-white/80 backdrop-blur-xl text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/40 relative group',
        className
      )}
      {...props}
    >
      {/* Decorative inner glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {(title || subtitle) && (
        <div className="flex flex-col space-y-1 p-6 md:p-8 border-b border-slate-100/60">
          {title && <h3 className="text-xl md:text-2xl font-black leading-none tracking-tight font-display text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>}
        </div>
      )}
      <div className={cn('p-6 md:p-8', !title && !subtitle && 'pt-6 md:pt-8')}>{children}</div>
    </div>
  );
};
