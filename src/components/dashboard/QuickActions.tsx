import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquarePlus,
  CalendarPlus,
  HeartHandshake,
  Camera,
  UserPlus,
  Zap,
} from 'lucide-react';
import type { RelationshipStatusType } from '@/store/relationshipStore';

interface QuickActionsProps {
  onSetStatus?: () => void;
  onCreatePlan?: () => void;
  onInvitePartner?: () => void;
  onCreateProposal?: () => void;
  onAddMemory?: () => void;
  onOpenSettings?: () => void;
  isPaired?: boolean;
  relationshipStatus?: RelationshipStatusType;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSetStatus,
  onCreatePlan,
  onInvitePartner,
  onCreateProposal,
  onAddMemory,
  isPaired = true,
  relationshipStatus = 'partnered',
}) => {
  const actions: Array<{
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
  }> = [
    {
      label: 'Set Status',
      icon: MessageSquarePlus,
      onClick: onSetStatus,
    },
    {
      label: 'Create Plan',
      icon: CalendarPlus,
      onClick: onCreatePlan,
    },
    {
      label: 'Create Proposal',
      icon: HeartHandshake,
      onClick: onCreateProposal,
      disabled: !isPaired,
    },
    {
      label: 'Add Memory',
      icon: Camera,
      onClick: onAddMemory,
      disabled: !isPaired,
    },
  ];

  if (relationshipStatus === 'single') {
    actions.push({
      label: 'Invite Partner',
      icon: UserPlus,
      onClick: onInvitePartner,
      disabled: false,
    });
  } else if (relationshipStatus === 'pending' || relationshipStatus === 'invited') {
    actions.push({
      label: 'Invitation Pending',
      icon: UserPlus,
      onClick: undefined,
      disabled: true,
    });
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
        <Zap className="w-3.5 h-3.5 text-primary" />
        Quick Actions:
      </span>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <motion.button
            key={act.label}
            whileHover={{ y: act.disabled ? 0 : -1 }}
            whileTap={{ scale: act.disabled ? 1 : 0.96 }}
            onClick={act.onClick}
            disabled={act.disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-primary/30 text-xs font-medium text-foreground shrink-0 transition-all ${
              act.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span>{act.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};


