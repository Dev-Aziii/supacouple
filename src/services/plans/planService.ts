import { plansRepository, type CreatePlanDTO, type UpdatePlanDTO } from '../repositories/plansRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import type { PlanItem } from '../../types/plan';

const OFFLINE_PLANS_QUEUE_KEY = 'supacouple_offline_plans_queue';

export interface OfflinePlanAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'complete';
  payload: unknown;
  partnerId?: string | null;
  timestamp: number;
}

export class PlanService {
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processOfflineQueue().catch((err) =>
          console.error('[PlanService] Failed auto-syncing offline queue:', err)
        );
      });
    }
  }

  /**
   * Helper to expand recurring plans into virtual instances within a target window.
   */
  public expandRecurringPlans(plans: PlanItem[], windowStart: Date, windowEnd: Date): PlanItem[] {
    const result: PlanItem[] = [];

    for (const plan of plans) {
      // Always include master plan if it falls within range
      const planStart = new Date(plan.startAt);
      const planEnd = new Date(plan.endAt);
      const durationMs = planEnd.getTime() - planStart.getTime();

      if (plan.repeat === 'none') {
        if (planStart <= windowEnd && planEnd >= windowStart) {
          result.push(plan);
        }
        continue;
      }

      // Add the master instance
      if (planStart <= windowEnd && planEnd >= windowStart) {
        result.push(plan);
      }

      // Virtual recurrence expansion
      const currentStart = new Date(planStart);
      const maxIterations = 366; // Safety limit
      let iteration = 0;

      while (iteration < maxIterations) {
        iteration++;

        // Advance currentStart based on repeat frequency
        if (plan.repeat === 'daily') {
          currentStart.setDate(currentStart.getDate() + 1);
        } else if (plan.repeat === 'weekly') {
          currentStart.setDate(currentStart.getDate() + 7);
        } else if (plan.repeat === 'monthly') {
          currentStart.setMonth(currentStart.getMonth() + 1);
        } else if (plan.repeat === 'yearly') {
          currentStart.setFullYear(currentStart.getFullYear() + 1);
        } else {
          break;
        }

        if (currentStart > windowEnd) break;

        const currentEnd = new Date(currentStart.getTime() + durationMs);

        if (currentEnd >= windowStart && currentStart <= windowEnd) {
          result.push({
            ...plan,
            id: `${plan.id}_v_${currentStart.getTime()}`,
            startAt: currentStart.toISOString(),
            endAt: currentEnd.toISOString(),
            isVirtual: true,
            originalPlanId: plan.id,
          });
        }
      }
    }

    // Sort by startAt ascending
    return result.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  async createPlan(dto: CreatePlanDTO, partnerId?: string | null): Promise<PlanItem> {
    if (!navigator.onLine) {
      const fakePlan: PlanItem = {
        id: `offline-${Date.now()}`,
        coupleId: dto.coupleId,
        createdBy: dto.createdBy,
        title: dto.title,
        description: dto.description,
        category: dto.category || 'custom',
        priority: dto.priority || 'medium',
        color: dto.color || '#ec4899',
        completed: dto.completed ?? false,
        status: dto.completed ? 'completed' : 'scheduled',
        startAt: dto.startAt,
        endAt: dto.endAt,
        location: dto.location,
        reminderMinutes: dto.reminderMinutes ?? null,
        repeat: dto.repeat || 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.enqueueOfflineAction({
        id: fakePlan.id,
        type: 'create',
        payload: dto,
        partnerId,
        timestamp: Date.now(),
      });
      return fakePlan;
    }

    const created = await plansRepository.create(dto);

    if (partnerId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: dto.createdBy,
          type: 'plan',
          title: 'New Shared Plan Created',
          body: `Partner created a new plan: "${created.title}"`,
        });
      } catch (err) {
        console.warn('[PlanService] Failed sending partner create notification:', err);
      }
    }

    return created;
  }

  async updatePlan(id: string, updates: UpdatePlanDTO, partnerId?: string | null, userId?: string): Promise<PlanItem> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'update',
        payload: { id, updates },
        partnerId,
        timestamp: Date.now(),
      });
      const existing = await plansRepository.getById(id);
      return {
        ...(existing || {
          id,
          coupleId: '',
          createdBy: '',
          title: '',
          category: 'custom',
          priority: 'medium',
          color: '#ec4899',
          completed: false,
          status: 'scheduled',
          startAt: new Date().toISOString(),
          endAt: new Date().toISOString(),
          repeat: 'none',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        ...updates,
        status: updates.completed !== undefined ? (updates.completed ? 'completed' : 'scheduled') : existing?.status || 'scheduled',
        updatedAt: new Date().toISOString(),
      };
    }

    const updated = await plansRepository.update(id, updates);

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'plan',
          title: 'Shared Plan Updated',
          body: `Partner updated the plan: "${updated.title}"`,
        });
      } catch (err) {
        console.warn('[PlanService] Failed sending partner update notification:', err);
      }
    }

    return updated;
  }

  async deletePlan(id: string, partnerId?: string | null, userId?: string): Promise<boolean> {
    const existing = await plansRepository.getById(id);

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'delete',
        payload: { id },
        partnerId,
        timestamp: Date.now(),
      });
      return true;
    }

    const success = await plansRepository.delete(id);

    if (success && partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'plan',
          title: 'Shared Plan Cancelled',
          body: `Partner cancelled/deleted plan: "${existing?.title || 'Shared plan'}"`,
        });
      } catch (err) {
        console.warn('[PlanService] Failed sending partner delete notification:', err);
      }
    }

    return success;
  }

  async completePlan(id: string, completed: boolean, partnerId?: string | null, userId?: string): Promise<PlanItem> {
    return this.updatePlan(
      id,
      { completed },
      partnerId,
      userId
    ).then(async (res) => {
      if (partnerId && userId) {
        try {
          await notificationRepository.create({
            recipientId: partnerId,
            senderId: userId,
            type: 'plan',
            title: completed ? 'Plan Completed! 🎉' : 'Plan Marked Incomplete',
            body: `Partner ${completed ? 'completed' : 'reopened'} plan: "${res.title}"`,
          });
        } catch (err) {
          console.warn('[PlanService] Failed sending complete notification:', err);
        }
      }
      return res;
    });
  }

  async getUpcomingPlans(coupleId: string, limit = 10): Promise<PlanItem[]> {
    const all = await plansRepository.getByCoupleId(coupleId);
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(now.getDate() + 60); // 60 days ahead horizon

    const expanded = this.expandRecurringPlans(all, now, futureLimit);
    return expanded.slice(0, limit);
  }

  async getPlansByMonth(coupleId: string, year: number, month: number): Promise<PlanItem[]> {
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Padding for calendar grid view (include start of week before and end of week after)
    const windowStart = new Date(startOfMonth);
    windowStart.setDate(windowStart.getDate() - windowStart.getDay());

    const windowEnd = new Date(endOfMonth);
    windowEnd.setDate(windowEnd.getDate() + (6 - windowEnd.getDay()));

    const masterPlans = await plansRepository.getByDateRange(
      coupleId,
      windowStart.toISOString(),
      windowEnd.toISOString()
    );

    return this.expandRecurringPlans(masterPlans, windowStart, windowEnd);
  }

  async getPlansByDate(coupleId: string, date: Date | string): Promise<PlanItem[]> {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const masterPlans = await plansRepository.getByCoupleId(coupleId);
    return this.expandRecurringPlans(masterPlans, startOfDay, endOfDay);
  }

  async getTodayPlans(coupleId: string): Promise<PlanItem[]> {
    return this.getPlansByDate(coupleId, new Date());
  }

  // --- Offline Queue Handling ---

  private enqueueOfflineAction(action: OfflinePlanAction): void {
    try {
      const raw = localStorage.getItem(OFFLINE_PLANS_QUEUE_KEY);
      const queue: OfflinePlanAction[] = raw ? JSON.parse(raw) : [];
      queue.push(action);
      localStorage.setItem(OFFLINE_PLANS_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[PlanService] Failed to enqueue offline plan action:', err);
    }
  }

  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;
    try {
      const raw = localStorage.getItem(OFFLINE_PLANS_QUEUE_KEY);
      if (!raw) return;
      const queue: OfflinePlanAction[] = JSON.parse(raw);
      if (!queue.length) return;

      localStorage.removeItem(OFFLINE_PLANS_QUEUE_KEY);

      for (const action of queue) {
        const payload = action.payload as Record<string, unknown>;
        if (action.type === 'create') {
          await this.createPlan(payload as unknown as CreatePlanDTO, action.partnerId);
        } else if (action.type === 'update') {
          await this.updatePlan(payload.id as string, payload.updates as UpdatePlanDTO, action.partnerId);
        } else if (action.type === 'delete') {
          await this.deletePlan(payload.id as string, action.partnerId);
        } else if (action.type === 'complete') {
          await this.completePlan(payload.id as string, payload.completed as boolean, action.partnerId);
        }
      }
    } catch (err) {
      console.error('[PlanService] Error flushing offline plans queue:', err);
    }
  }
}

export const planService = new PlanService();
