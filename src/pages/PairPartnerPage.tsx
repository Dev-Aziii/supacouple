import React, { useState } from 'react';
import { useCouple, usePendingInvites, useCreateInvite, useAcceptInvite, useDeclineInvite, useCancelInvite, useLeaveRelationship } from '@/hooks/useCouple';
import { RelationshipStatus } from '@/components/couple/RelationshipStatus';
import { PartnerCard } from '@/components/couple/PartnerCard';
import { InviteCodeDisplay } from '@/components/couple/InviteCodeDisplay';
import { InvitationList } from '@/components/couple/InvitationList';
import { AcceptInviteDialog } from '@/components/couple/AcceptInviteDialog';
import { LeaveRelationshipDialog } from '@/components/couple/LeaveRelationshipDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { Heart, Send, KeyRound, Sparkles } from 'lucide-react';

export const PairPartnerPage: React.FC = () => {
  const { couple, partner, relationshipStatus, isLoading } = useCouple();
  const { sent, received } = usePendingInvites();

  const { mutateAsync: createInvite, isPending: isSendingInvite } = useCreateInvite();
  const { mutateAsync: acceptInvite, isPending: isAccepting } = useAcceptInvite();
  const { mutate: declineInvite, isPending: isDeclining } = useDeclineInvite();
  const { mutate: cancelInvite, isPending: isCancelling } = useCancelInvite();
  const { mutateAsync: leaveRelationship, isPending: isLeaving } = useLeaveRelationship();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [enterCodeInput, setEnterCodeInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [selectedCodeForModal, setSelectedCodeForModal] = useState('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  if (isLoading) {
    return <FullScreenLoader message="Loading relationship details..." />;
  }

  const activeSentInvite = sent.length > 0 ? sent[0] : null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!recipientEmail.trim()) {
      setFormError('Please enter partner email');
      return;
    }

    try {
      await createInvite({ email: recipientEmail });
      setFormSuccess('Invitation sent successfully!');
      setRecipientEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invite';
      setFormError(msg);
    }
  };

  const handleQuickAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!enterCodeInput.trim()) {
      setFormError('Please enter an invitation code');
      return;
    }

    try {
      await acceptInvite({ code: enterCodeInput.trim() });
      setEnterCodeInput('');
      setFormSuccess('Successfully connected with your partner!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invitation';
      setFormError(msg);
    }
  };

  const openAcceptModalWithCode = (code: string) => {
    setSelectedCodeForModal(code);
    setIsAcceptModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>Couple Pairing & Invitation</span>
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Invite your partner or enter an invite code to pair your accounts.
        </p>
      </div>

      {/* 1. Current Status */}
      <RelationshipStatus
        status={relationshipStatus}
        relationshipName={couple?.relationshipName}
        partnerName={partner?.displayName}
      />

      {/* 2. Partnered State vs Un-paired State */}
      {relationshipStatus === 'partnered' && partner ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PartnerCard
            partner={partner}
            couple={couple}
            onLeaveRelationship={() => setIsLeaveModalOpen(true)}
          />

          <Card className="border-rose-500/20 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                <span>Relationship Details</span>
              </CardTitle>
              <CardDescription>
                Your connected couple information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                <span className="text-xs text-muted-foreground">Relationship Name</span>
                <p className="font-semibold text-foreground">{couple?.relationshipName || 'Partner Pair'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                  {couple?.status || 'Active'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                <span className="text-xs text-muted-foreground">Connected Since</span>
                <p className="font-semibold text-foreground">
                  {couple?.createdAt ? new Date(couple.createdAt).toLocaleDateString() : 'Connected'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Sent Invite Code Display */}
          {activeSentInvite && (
            <InviteCodeDisplay
              code={activeSentInvite.inviteCode}
              expiresAt={activeSentInvite.expiresAt}
              recipientEmail={activeSentInvite.email}
              onCancel={() => cancelInvite(activeSentInvite.id)}
              isCancelling={isCancelling}
            />
          )}

          {/* Form Actions: Send Invite & Enter Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Invite Form */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Send className="h-5 w-5 text-rose-500" />
                  <span>Invite Your Partner</span>
                </CardTitle>
                <CardDescription>
                  Send an email invitation code to your partner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="partner-email-input" className="text-xs font-semibold text-foreground">
                      Partner Email Address
                    </label>
                    <Input
                      id="partner-email-input"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="partner@example.com"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSendingInvite || !recipientEmail.trim()}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2"
                  >
                    {isSendingInvite ? (
                      <>
                        <ButtonSpinner />
                        <span>Sending Invite...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Enter Code Form */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-rose-500" />
                  <span>Enter Invite Code</span>
                </CardTitle>
                <CardDescription>
                  Have an invite code from your partner? Enter it here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickAccept} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="quick-code-input" className="text-xs font-semibold text-foreground">
                      8-Character Invite Code
                    </label>
                    <Input
                      id="quick-code-input"
                      type="text"
                      value={enterCodeInput}
                      onChange={(e) => setEnterCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. AB7Q9KX2"
                      maxLength={10}
                      required
                      className="font-mono tracking-widest uppercase text-center font-bold"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isAccepting || !enterCodeInput.trim()}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2"
                  >
                    {isAccepting ? (
                      <>
                        <ButtonSpinner />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        <span>Connect Partner</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              {formSuccess}
            </div>
          )}

          {/* Pending Invitations List */}
          <InvitationList
            sent={sent}
            received={received}
            onAccept={openAcceptModalWithCode}
            onDecline={(id) => declineInvite(id)}
            onCancel={(id) => cancelInvite(id)}
            isAccepting={isAccepting}
            isDeclining={isDeclining}
            isCancelling={isCancelling}
          />
        </div>
      )}

      {/* Modals */}
      <AcceptInviteDialog
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        initialCode={selectedCodeForModal}
        onAccept={async (code, anniv) => {
          await acceptInvite({ code, anniversary: anniv });
        }}
        isAccepting={isAccepting}
      />

      <LeaveRelationshipDialog
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        partnerName={partner?.displayName || 'your partner'}
        onConfirm={async () => {
          await leaveRelationship();
        }}
        isLeaving={isLeaving}
      />
    </div>
  );
};

export default PairPartnerPage;
