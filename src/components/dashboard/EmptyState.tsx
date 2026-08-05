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
    <Card className="border-dashed border-pink-200 bg-pink-50/30 text-center py-6">
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
};

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = 'h-32' }) => {
  return (
    <div className={`w-full ${height} bg-gray-100 animate-pulse rounded-xl border border-gray-200`} />
  );
};
