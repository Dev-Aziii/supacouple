import React, { useState } from 'react';
import { useRealtimePlans } from '../hooks/useRealtimePlans';
import { useSession } from '../hooks/useSession';
import { CalendarView } from '../components/plans/CalendarView';
import { PlanDialog } from '../components/plans/PlanDialog';
import type { PlanItem } from '../types/plan';
import type { CreatePlanDTO, UpdatePlanDTO } from '../services/repositories/plansRepository';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const CalendarPage: React.FC = () => {
  const { user } = useSession();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const {
    monthPlans,
    isMonthPlansLoading,
    createPlan,
    updatePlan,
    deletePlan,
    completePlan,
  } = useRealtimePlans({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<PlanItem | null>(null);
  const [initialDateForDialog, setInitialDateForDialog] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPlan = (date?: Date) => {
    setSelectedPlanToEdit(null);
    setInitialDateForDialog(date || currentDate);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: PlanItem) => {
    setSelectedPlanToEdit(plan);
    setInitialDateForDialog(undefined);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (dto: CreatePlanDTO | UpdatePlanDTO) => {
    setIsSubmitting(true);
    try {
      if (selectedPlanToEdit) {
        const targetId = selectedPlanToEdit.originalPlanId || selectedPlanToEdit.id;
        await updatePlan({ id: targetId, updates: dto });
        toast.success('Plan updated successfully');
      } else {
        await createPlan(dto as CreatePlanDTO);
        toast.success('Plan created successfully');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed saving plan';
      toast.error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (plan: PlanItem) => {
    try {
      const targetId = plan.originalPlanId || plan.id;
      await completePlan({ id: targetId, completed: !plan.completed });
      toast.success(plan.completed ? 'Plan marked incomplete' : 'Plan completed! 🎉');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed toggling plan completion';
      toast.error(msg);
    }
  };

  const handleDeletePlan = async (plan: PlanItem) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.title}"?`)) return;
    try {
      const targetId = plan.originalPlanId || plan.id;
      await deletePlan(targetId);
      toast.success('Plan deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed deleting plan';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CalendarIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            Shared Calendar & Plans
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Coordinate dates, trips, reminders, and activities together in real time.
          </p>
        </div>
      </div>

      {/* Main Calendar View */}
      {isMonthPlansLoading ? (
        <div className="flex items-center justify-center h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-5 h-5 animate-spin text-pink-500" />
            <span>Loading shared calendar...</span>
          </div>
        </div>
      ) : (
        <CalendarView
          plans={monthPlans}
          currentUserId={user?.id}
          currentDate={currentDate}
          onDateChange={(d) => setCurrentDate(d)}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onSelectPlan={handleEditPlan}
          onAddPlan={handleAddPlan}
        />
      )}

      {/* Plan Dialog Modal */}
      <PlanDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        planToEdit={selectedPlanToEdit}
        initialDate={initialDateForDialog}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
