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
        'rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="flex flex-col space-y-1.5 p-6 border-bottom">
          {title && <h3 className="text-xl font-semibold leading-none tracking-tight font-display">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className={cn('p-6 pt-0', !title && !subtitle && 'pt-6')}>{children}</div>
    </div>
  );
};
