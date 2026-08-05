import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}) => {
  return (
    <Card className="border-dashed border-border bg-secondary/20 text-center py-4 shadow-none">
      <CardContent className="flex flex-col items-center justify-center p-3">
        <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-2 border border-border">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-semibold text-foreground mb-0.5">{title}</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs mb-3">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
};

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = 'h-24' }) => {
  return (
    <div className={`w-full ${height} bg-secondary animate-pulse rounded-xl border border-border`} />
  );
};

