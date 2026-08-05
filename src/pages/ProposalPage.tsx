import React from 'react';
import { Send, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const ProposalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="w-7 h-7 text-rose-400" />
            <span>Spontaneous Proposals</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Send instant date & trip proposals with quick reply options
          </p>
        </div>
        <Button disabled variant="secondary" className="w-full sm:w-auto">
          <Zap className="w-4 h-4 mr-1.5" /> Propose Now
        </Button>
      </div>

      <Card className="text-center py-16 px-4">
        <CardHeader className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Proposal Engine</CardTitle>
          <CardDescription>
            Instant pop-up invitations, countdown responses, and live notifications will be integrated in Phase 4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
};
