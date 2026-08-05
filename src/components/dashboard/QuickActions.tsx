import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquarePlus,
  CalendarPlus,
  HeartHandshake,
  Camera,
  UserPlus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
  onSetStatus?: () => void;
  onCreatePlan?: () => void;
  onInvitePartner?: () => void;
  onCreateProposal?: () => void;
  onAddMemory?: () => void;
  onOpenSettings?: () => void;
  isPaired?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSetStatus,
  onCreatePlan,
  onInvitePartner,
  onCreateProposal,
  onAddMemory,
  isPaired = true,
}) => {
  const actions = [
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
    {
      label: 'Invite Partner',
      icon: UserPlus,
      onClick: onInvitePartner,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.label}
                whileHover={{ y: act.disabled ? 0 : -2 }}
                whileTap={{ scale: act.disabled ? 1 : 0.98 }}
                onClick={act.onClick}
                disabled={act.disabled}
                className={`p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 hover:border-border text-foreground font-medium text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                  act.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-center truncate w-full">{act.label}</span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

