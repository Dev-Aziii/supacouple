import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
      <CardContent className="p-6 sm:p-8">{children}</CardContent>
    </Card>
  );
};
