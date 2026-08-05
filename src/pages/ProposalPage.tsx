import React, { useState, useMemo } from 'react';
import { useRealtimeProposals } from '@/hooks/useRealtimeProposals';
import { useSession } from '@/hooks/useSession';
import { SpontaneousProposal, CreateProposalDTO } from '@/types/proposal';
import {
  ProposalFilters,
  ProposalTab,
  ProposalList,
  ProposalDialog,
  ProposalDetails,
} from '@/components/proposals';
import { Send, Plus } from 'lucide-react';

export const ProposalPage: React.FC = () => {
  const { user } = useSession();
  const userId = user?.id || '';

  const {
    proposals,
    isLoading,
    createProposal,
    updateProposal,
    deleteProposal,
    acceptProposal,
    declineProposal,
    maybeProposal,
    counterProposal,
  } = useRealtimeProposals();

  const [activeTab, setActiveTab] = useState<ProposalTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<SpontaneousProposal | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<SpontaneousProposal | null>(null);

  // Tab Counts
  const counts = useMemo(() => {
    const now = new Date().toISOString();
    return {
      all: proposals.length,
      pending: proposals.filter((p) => p.status === 'pending').length,
      upcoming: proposals.filter(
        (p) => (p.status === 'accepted' || p.status === 'pending') && p.proposedTime >= now
      ).length,
      history: proposals.filter((p) => p.status !== 'pending').length,
      sent: proposals.filter((p) => p.senderId === userId).length,
      received: proposals.filter((p) => p.senderId !== userId).length,
      completed: proposals.filter((p) => p.status === 'completed').length,
      cancelled: proposals.filter((p) => p.status === 'cancelled').length,
    };
  }, [proposals, userId]);

  // Filtered Proposals Logic
  const filteredProposals = useMemo(() => {
    const now = new Date().toISOString();
    return proposals
      .filter((p) => {
        // Tab Filtering
        if (activeTab === 'pending') if (p.status !== 'pending') return false;
        if (activeTab === 'upcoming')
          if (!((p.status === 'accepted' || p.status === 'pending') && p.proposedTime >= now))
            return false;
        if (activeTab === 'history') if (p.status === 'pending') return false;
        if (activeTab === 'sent') if (p.senderId !== userId) return false;
        if (activeTab === 'received') if (p.senderId === userId) return false;
        if (activeTab === 'completed') if (p.status !== 'completed') return false;
        if (activeTab === 'cancelled') if (p.status !== 'cancelled') return false;

        // Category Filtering
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

        // Priority Filtering
        if (selectedPriority !== 'all' && p.priority !== selectedPriority) return false;

        // Search Query Filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchLoc = p.location?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.proposedTime).getTime();
        const timeB = new Date(b.proposedTime).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [proposals, activeTab, selectedCategory, selectedPriority, searchQuery, sortOrder, userId]);

  const handleCreateSubmit = async (data: Omit<CreateProposalDTO, 'coupleId' | 'senderId'>) => {
    if (editingProposal) {
      await updateProposal({ id: editingProposal.id, updates: data });
      setEditingProposal(null);
    } else {
      await createProposal(data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Date & Trip Proposals</h1>
              <p className="text-xs text-muted-foreground">
                Plan memorable dates, trips, and activities with interactive responses
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProposal(null);
            setIsCreateOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Proposal</span>
        </button>
      </div>

      {/* Filters & Tabs */}
      <ProposalFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        sortOrder={sortOrder}
        onSortToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        counts={counts}
      />

      {/* Proposals Grid / List */}
      <ProposalList
        proposals={filteredProposals}
        currentUserId={userId}
        isLoading={isLoading}
        onProposalClick={(proposal) => setSelectedProposal(proposal)}
        onCreateClick={() => setIsCreateOpen(true)}
        emptyTitle={
          activeTab === 'pending'
            ? 'No pending proposals'
            : activeTab === 'upcoming'
            ? 'No upcoming proposed plans'
            : 'No proposals found'
        }
        emptyDescription="Create a new date proposal to invite your partner to something special!"
      />

      {/* Create / Edit Dialog */}
      <ProposalDialog
        isOpen={isCreateOpen || Boolean(editingProposal)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProposal(null);
        }}
        onSubmit={handleCreateSubmit}
        initialValues={editingProposal || undefined}
      />

      {/* Detail Inspector Modal */}
      <ProposalDetails
        proposal={selectedProposal}
        isOpen={Boolean(selectedProposal)}
        onClose={() => setSelectedProposal(null)}
        onAccept={async (id, note) => {
          await acceptProposal({ id, note });
          setSelectedProposal((prev) => (prev ? { ...prev, status: 'accepted', responseNote: note } : null));
        }}
        onDecline={async (id, note) => {
          await declineProposal({ id, note });
          setSelectedProposal((prev) => (prev ? { ...prev, status: 'declined', responseNote: note } : null));
        }}
        onMaybe={async (id, note) => {
          await maybeProposal({ id, note });
          setSelectedProposal((prev) => (prev ? { ...prev, status: 'maybe', responseNote: note } : null));
        }}
        onCounter={async (data) => {
          await counterProposal(data);
          setSelectedProposal(null);
        }}
        onDelete={async (id) => {
          await deleteProposal(id);
          setSelectedProposal(null);
        }}
        onEdit={(prop) => {
          setSelectedProposal(null);
          setEditingProposal(prop);
        }}
      />
    </div>
  );
};
