import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquarePlus,
  CalendarPlus,
  UserPlus,
  Gift,
  Camera,
  PlusCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
  onSetStatus?: () => void;
  onCreatePlan?: () => void;
  onInvitePartner?: () => void;
  onCreateProposal?: () => void;
  onAddMemory?: () => void;
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
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      label: 'Create Plan',
      icon: CalendarPlus,
      onClick: onCreatePlan,
      color: 'bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-950/40 dark:text-pink-400',
    },
    {
      label: 'Create Proposal',
      icon: Gift,
      onClick: onCreateProposal,
      disabled: !isPaired,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400',
    },
    {
      label: 'Add Memory',
      icon: Camera,
      onClick: onAddMemory,
      disabled: !isPaired,
      color: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      label: 'Invite Partner',
      icon: UserPlus,
      onClick: onInvitePartner,
      color: 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400',
    },
  ];

  return (
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <PlusCircle className="w-5 h-5 text-pink-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.label}
                whileHover={{ scale: act.disabled ? 1 : 1.03 }}
                whileTap={{ scale: act.disabled ? 1 : 0.97 }}
                onClick={act.onClick}
                disabled={act.disabled}
                className={`p-3 rounded-xl border border-transparent font-semibold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-2xs ${
                  act.color
                } ${act.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-center">{act.label}</span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
