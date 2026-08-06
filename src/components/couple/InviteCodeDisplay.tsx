import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Copy, Check, Share2, ShieldCheck, Clock } from 'lucide-react';

interface InviteCodeDisplayProps {
  code: string;
  expiresAt?: string;
  recipientEmail?: string;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export const InviteCodeDisplay: React.FC<InviteCodeDisplayProps> = ({
  code,
  expiresAt,
  recipientEmail,
  onCancel,
  isCancelling = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tezā Partner Invitation',
          text: `Join me on Tezā! Use my invitation code: ${code}`,
          url: window.location.origin,
        });
      } catch (err) {
        console.warn('Share dismissed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '7 days';

  return (
    <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-card to-card shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ShieldCheck className="h-32 w-32 text-rose-500" />
      </div>

      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span>Your Partner Invite Code</span>
        </CardTitle>
        <CardDescription>
          {recipientEmail ? (
            <span>
              Sent to <strong className="text-foreground font-semibold">{recipientEmail}</strong>
            </span>
          ) : (
            'Share this code with your partner so they can connect with you.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prominent Code Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <span
            className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-rose-600 dark:text-rose-400 select-all"
            aria-label={`Invite code: ${code.split('').join(' ')}`}
          >
            {code}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial gap-2 border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
              aria-label="Copy invite code"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-rose-600 hover:bg-rose-500/10"
              title="Share invite code"
              aria-label="Share invite code"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expiry & Cancel Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Expires: {formattedExpiry}</span>
          </div>

          {onCancel && (
            <Button
              type="button"
              variant="link"
              onClick={onCancel}
              disabled={isCancelling}
              className="p-0 h-auto text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Invite'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
