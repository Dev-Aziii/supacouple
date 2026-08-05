import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './card';

export const SkeletonCard: React.FC = () => {
  return (
    <Card className="w-full max-w-md animate-pulse border-border/40 bg-card/60 backdrop-blur">
      <CardHeader className="space-y-2">
        <div className="h-6 w-1/2 rounded bg-muted/60" />
        <div className="h-4 w-3/4 rounded bg-muted/40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-10 w-full rounded bg-muted/50" />
        <div className="h-10 w-full rounded bg-muted/50" />
      </CardContent>
      <CardFooter>
        <div className="h-10 w-full rounded bg-muted/70" />
      </CardFooter>
    </Card>
  );
};
