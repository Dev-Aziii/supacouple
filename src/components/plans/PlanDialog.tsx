import React, { useEffect } from 'react';
import type { PlanItem } from '../../types/plan';
import type { CreatePlanDTO, UpdatePlanDTO } from '../../services/repositories/plansRepository';
import { PlanForm } from './PlanForm';
import { X } from 'lucide-react';

interface PlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: PlanItem | null;
  initialDate?: Date;
  onSubmit: (dto: CreatePlanDTO | UpdatePlanDTO) => Promise<void>;
  isSubmitting?: boolean;
}

export const PlanDialog: React.FC<PlanDialogProps> = ({
  isOpen,
  onClose,
  planToEdit,
  initialDate,
  onSubmit,
  isSubmitting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initialValues: Partial<PlanItem> | undefined = planToEdit
    ? planToEdit
    : initialDate
    ? { startAt: initialDate.toISOString() }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all transform scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 id="plan-dialog-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {planToEdit ? 'Edit Shared Plan' : 'Create Shared Plan'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <PlanForm
          initialValues={initialValues}
          onSubmit={async (dto) => {
            await onSubmit(dto);
            onClose();
          }}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};
